// Define the Pet type
export interface Pet {
  name: string;
  type: string;
  breed: string;
  gender: string;
  neutered: boolean;
  birthYear: number;
  image: string;
  url: string;
  text: string;
}

// Define the Filter type (optional fields)
export interface Filter {
  type?: string; // Marked as optional
}

// Define the IndividualPetAnswer type
export interface IndividualPetAnswer {
  petId: string;
  image: string;
  url: string;
  answer: string;
}

// Define the ResponseType type
export interface ResponseType {
  generalAnswer: string;
  individualPetAnswers: IndividualPetAnswer[];
}
