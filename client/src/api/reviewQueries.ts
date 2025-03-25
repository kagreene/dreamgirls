import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      _id
      username
      email
      reviews {
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
        createdAt
      }
    }
  }
`;

export const GET_REVIEWS = gql`
  query GetReviews {
    reviews {
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

export const GET_REVIEW = gql`
  query GetReview($reviewId: ID!) {
    review(reviewId: $reviewId) {
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

export const GET_REVIEWS_BY_LOCATION = gql`
  query GetReviewsByLocation($lng: Float!, $lat: Float!, $distance: Int) {
    reviewsByLocation(lng: $lng, lat: $lat, distance: $distance) {
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

export const GET_REVIEWS_BY_ADDRESS = gql`
  query GetReviewsByAddress($address: String!) {
    reviewsByAddress(address: $address) {
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