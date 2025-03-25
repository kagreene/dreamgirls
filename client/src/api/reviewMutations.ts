import { gql } from '@apollo/client';

export const ADD_REVIEW = gql`
  mutation AddReview($reviewData: ReviewInput!) {
    addReview(reviewData: $reviewData) {
      _id
      title
      description
      reviewType
      severity
      location {
        type
        coordinates
        address
      }
      author {
        _id
        username
      }
      createdAt
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($reviewId: ID!, $reviewData: ReviewInput!) {
    updateReview(reviewId: $reviewId, reviewData: $reviewData) {
      _id
      title
      description
      reviewType
      severity
      location {
        type
        coordinates
        address
      }
      author {
        _id
        username
      }
      createdAt
    }
  }
`;

export const REMOVE_REVIEW = gql`
  mutation RemoveReview($reviewId: ID!) {
    removeReview(reviewId: $reviewId) {
      _id
    }
  }
`;

export const ADD_USER = gql`
  mutation AddUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;