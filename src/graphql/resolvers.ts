import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo"
import { IResolvers } from "@graphql-tools/utils";
import { createUser, validateUser } from "../collections/usersExamenFinal";
import { signToken } from "../auth";
import { COLLECTION_OWNED_POKEMONS } from '../utils';
import { CreatePokemon, getPokemonById, getPokemons, addPokemonToUser, removePokemonToUser} from "../collections/pokemonsFinal";
import { PokemonUser } from "../types";

export const resolvers: IResolvers = {

    Query: {
      me: async (_, __, { user }) => {
        if (!user) return null;

        return {
          _id: user._id.toString(),
          name: user.name,
          pokemons: user.pokemons || [],
        };
      },
      pokemons: async (_, { page, size }) => {
        return await getPokemons(page, size);
      },
      pokemon: async (_, { id }) => { 
        return await getPokemonById(id)
      },
    },
  
    Mutation: {
        startJourney: async (_,{ name, password }: { name: string; password: string }) => {
          const userId = await createUser(name, password);
          return signToken(userId);
        },
        login: async (_,{ name, password }: { name: string; password: string }) => {
          const user = await validateUser(name, password);
          if (!user) throw new Error("Invalid credentials");
          return signToken(user._id.toString());
        },
        createPokemon: async (_, { name, description, height, weight, types }, { user }) => {
          if (!user)  throw new Error("No tienes permisos para agregar Pokémon");
          return CreatePokemon({ name, description, height, weight, types});
        },
        catchPokemon: (_, { pokemonId, nickname }, { user }) => {
          if (!user) throw new Error("Not authenticated");
          return addPokemonToUser(user._id, pokemonId, nickname);
        },
        freePokemon: (_, { ownedPokemonId }, { user }) => {
          if (!user) throw new Error("Not authenticated");
          return removePokemonToUser(user._id, ownedPokemonId);
        },
      },
      Trainer: {
        pokemons: async (parent: PokemonUser) => {
            const db = getDB();
            const listaDeIdsDePokemons = parent.pokemons;
            if(!listaDeIdsDePokemons) return [];
            const objectIds = listaDeIdsDePokemons.map((id) => new ObjectId(id));
            return db
                .collection(COLLECTION_OWNED_POKEMONS)
                .find({ _id: { $in: objectIds } })
                .toArray();
        }
    }
    };