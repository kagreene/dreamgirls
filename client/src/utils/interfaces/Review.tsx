//TODO: verify if we need this file and if so, modify as needed
// export interface Location {
//     type: string;
//     coordinates: [number, number];
//     address?: string;
//   }
  
//   export interface Comment {
//     _id: string;
//     commentText: string;
//     commentAuthor: {
//       _id: string;
//       username: string;
//     };
//     createdAt: string;
//   }
  
//   export interface Review {
//     _id: string;
//     title: string;
//     description: string;
//     reportType: 'harassment' | 'theft' | 'assault' | 'unsafe_environment' | 'other';
//     location: Location;
//     severity: number;
//     verified: boolean;
//     upvotes: number;
//     downvotes: number;
//     reportedBy: {
//       _id: string;
//       username: string;
//     };
//     comments?: Comment[];
//     createdAt: string;
//     updatedAt: string;
//   }