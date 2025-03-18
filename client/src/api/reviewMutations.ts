//TODO: review/replace/revise review Mutations below
import { gql } from 'graphql-tag';

export const ADD_REVIEW = gql`
  mutation AddReview($reviewData: ReviewInput!) {
    addReview(reviewData: $reviewData) {
      _id
      title
      description
      reviewType
      location {
        type
        coordinates
        address
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
  mutation UpvoteReview($reviewId: ID!) {
    upvoteReview(reviewId: $reviewId) {
      _id
      upvotes
      downvotes
    }
  }
`;

export const DOWNVOTE_REVIEW = gql`
  mutation DownvoteReview($reviewId: ID!) {
    downvoteReview(reviewId: $reviewId) {
      _id
      upvotes
      downvotes
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($reviewId: ID!, $commentText: String!) {
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