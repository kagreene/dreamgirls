export interface Point {
    type: string;
    coordinates: number[];
    address: string;
  }
  
  export interface User {
    _id: string;
    username: string;
    email?: string;
    reviews?: Review[];
  }
  
  export interface Review {
    _id: string;
    title: string;
    description: string;
    reviewType: string;
    severity: number;
    location: Point;
    author: User;
    createdAt: string;
  }
  
  export interface ReviewInput {
    title: string;
    description: string;
    reviewType: string;
    severity: number;
    location: {
      type: string;
      coordinates: number[];
      address: string;
    };
  }