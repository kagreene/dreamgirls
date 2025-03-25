import { gql } from 'graphql-tag';

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    reviews: [Review]
  }

  type Point {
    type: String
    coordinates: [Float]
    address: String
  }

  type Review {
    _id: ID
    title: String
    description: String
    reviewType: String
    severity: Int
    location: Point
    author: User
    createdAt: String
  }

  type Auth {
    token: String
    user: User
  }

  input PointInput {
    type: String
    coordinates: [Float]
    address: String
  }

  input ReviewInput {
    title: String!
    description: String!
    reviewType: String!
    severity: Int!
    location: PointInput!
  }

  type Query {
    me: User
    users: [User]
    user(username: String!): User
    reviews: [Review]
    reviewsByLocation(lng: Float!, lat: Float!, distance: Int): [Review]
    reviewsByAddress(address: String!): [Review]
    review(reviewId: ID!): Review
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    addReview(reviewData: ReviewInput!): Review
    updateReview(reviewId: ID!, reviewData: ReviewInput!): Review
    removeReview(reviewId: ID!): Review
  }
`;

export default typeDefs;