import { gql } from "@apollo/client";

export const ADD_USER = gql`
  mutation addUser($input: UserInput!) {
    addUser(input: $input) {
      user {
        _id
        username
        email
      }
      token
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const ADD_REVIEW = gql`
  mutation addReview($reviewData: ReviewInput!) {
    addReview(reviewData: $reviewData) {
      _id
      description
      reviewType
      location {
        address
        coordinates
      }
      createdAt
      reviewedBy {
        _id
        username
      }
      createdAt
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation updateReview($reviewId: ID!, $reviewData: ReviewInput!) {
    updateReview(reviewId: $reviewId, reviewData: $reviewData) {
      _id
      description
      reviewType
      location {
        address
        coordinates
      }
      severity
      verified
      reviewedBy {
        _id
        username
      }
      createdAt
    }
  }
`;

export const REMOVE_REVIEW = gql`
  mutation removeReview($reviewId: ID!) {
    removeReview(reviewId: $reviewId) {
      _id
    }
  }
`;

export const VERIFY_REVIEW = gql`
  mutation verifyReview($reviewId: ID!) {
    verifyReview(reviewId: $reviewId) {
      _id
      description
      reviewType
      location {
        address
        coordinates
      }
      severity
      verified
      reviewedBy {
        _id
        username
      }
      createdAt
    }
  }
`;

export const UPVOTE_REVIEW = gql`
  mutation upvoteReview($reviewId: ID!) {
    upvoteReview(reviewId: $reviewId) {
      _id
      upvotes
      voteRatio
    }
  }
`;

export const DOWNVOTE_REVIEW = gql`
  mutation downvoteReview($reviewId: ID!) {
    downvoteReview(reviewId: $reviewId) {
      _id
      downvotes
      voteRatio
    }
  }
`;

export const ADD_COMMENT = gql`
    mutation addComment($reviewId: ID!, $commentText: String!) {
        addComment(reviewId: $reviewId, commentText: $commentText) {
            _id
            comments {
                _id
                commentText 
                commentAuthor {
                    _id
                    username
                }
                createdAt
            }
        }
    }
`;

export const REMOVE_COMMENT = gql`
    mutation removeComment($reviewId: ID!, $commentId: ID!) {
        removeComment(reviewId: $reviewId, commentId: $commentId) {
        _id
            comments {
                _id
                commentText 
                commentAuthor {
                    _id
                    username
                }
                createdAt
            }
        }
    }
`;
