import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo"
import { COLLECTION_OWNED_POKEMONS, COLLECTION_POKEMONS, COLLECTION_USERS } from "../utils";

export interface CosaInput {
  atributo: String
}
export enum PokemonType {
    NORMAL,
    FIRE,
    WATER,
    ELECTRIC,
    GRASS,
    ICE,
    FIGHTING,
    POISON,
    GROUND,
    FLYING,
    PSYCHIC,
    BUG,
    ROCK,
    GHOST,
    DRAGON
  }



export const getPokemons = async (page?: number, size?: number) => {
    const db = getDB();
    page = page || 1;
    size = size || 10;
    return await db.collection(COLLECTION_POKEMONS).find().skip((page - 1) * size).limit(size).toArray();
};

export const getPokemonById = async (id: string) => {
    const db = getDB();
    return await db.collection(COLLECTION_POKEMONS).findOne({_id: new ObjectId(id)});
};

export const CreatePokemon = async (pokemon: { name: string; description: string; height: number; weight: number; types: PokemonType})  => {
  const db = getDB();
  const result = await db.collection(COLLECTION_POKEMONS).insertOne({
    name: pokemon.name,
    description: pokemon.description,
    height: pokemon.height,
    weight: pokemon.weight,
    type: pokemon.types,
  });
  const newPokemon = await db.collection(COLLECTION_POKEMONS).findOne({ _id: result.insertedId });
  if (!newPokemon) throw new Error("Error creando el Pokémon");
  return {
    _id: newPokemon._id.toString(),
    name: newPokemon.name,
    description: newPokemon.description,
    height: newPokemon.height,
    weight: newPokemon.weight,
    type: newPokemon.types,
  };
};

export const addPokemonToUser = async ( pokemonId: string, nickname: string, userId: string ) => {
  const db = getDB();

  if (!ObjectId.isValid(pokemonId)) {
    throw new Error("pokemonId Invalido");
  }

  const localUserId = new ObjectId(userId);
  const localPokemonId = new ObjectId(pokemonId);

  const pokemon = await db
    .collection(COLLECTION_POKEMONS)
    .findOne({ _id: localPokemonId });

  if (!pokemon) {
    throw new Error("Pokemon no encontrado");
  }

  const ownedPokemon = {
    pokemonId: localPokemonId,
    nickname: nickname ?? null,
    attack: pokemon.attack,
    defense: pokemon.defense,
    speed: pokemon.speed,
    special: pokemon.special,
    level: 1,
  };

  const insertResult = await db
    .collection(COLLECTION_OWNED_POKEMONS)
    .insertOne(ownedPokemon);

  await db.collection(COLLECTION_USERS).updateOne(
    { _id: localUserId },
    {
      $push: { pokemons: insertResult.insertedId } as any
    }
  );

  const updatedUser = await db
    .collection(COLLECTION_USERS)
    .findOne({ _id: localUserId });

  return updatedUser;
};


export const removePokemonToUser = async (ownedPokemonId: string, userId: string) => {
  const db = getDB();

  const localUserId = new ObjectId(userId);
  const localOwnedPokemonId = new ObjectId(ownedPokemonId);

  const ownedPokemon = await db
    .collection(COLLECTION_OWNED_POKEMONS)
    .findOne({ _id: localOwnedPokemonId });

  if (!ownedPokemon) {
    throw new Error("OwnedPokemon no encontrado");
  }

  if (!ownedPokemon.trainerId.equals(localUserId)) {
    throw new Error("solo puedes soltar tus propios pokemons");
  }

  await db.collection(COLLECTION_USERS).updateOne(
    { _id: localUserId },
    {
      $pull: { pokemons: localOwnedPokemonId } as any
    }
  );

  await db
    .collection(COLLECTION_OWNED_POKEMONS)
    .deleteOne({ _id: localOwnedPokemonId });

  const updatedUser = await db
    .collection(COLLECTION_USERS)
    .findOne({ _id: localUserId });

  return updatedUser;
};

const generateSTATs = () => ({
  attack: Math.floor(Math.random() * 101) + 1,
  defense: Math.floor(Math.random() * 101) + 1,
  speed: Math.floor(Math.random() * 101) + 1,
  special: Math.floor(Math.random() * 101) + 1,
  level: Math.floor(Math.random() * 101) + 1,
});
