import { ObjectId } from "mongodb";


export type PokemonUser = {
    _id: string;
    name: string;
    pokemons: ObjectId[];
}



//Esto se usara en el resolvers para encadenamiento

