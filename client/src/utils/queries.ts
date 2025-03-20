import { gql } from '@apollo/client';

export const QUERY_USER = gql `
    query getUser($username: String!) {
        user(username: $username) {
            _id
            username
            email
            reviews {
                _id
                reviewType
                location
            }
        }
    }
`;
export const QUERY_REVIEWS = gql `
    query getReviews {
        reviews {
            _id
            description
            reviewType
            location
            createdAt
            reviewedBy {
                _id
                username
            }
        }
    }
`;

export const QUERY_REVIEW = gql `
    query getReview($reviewId: ID!) {
        review(reviewId: $reviewId) {
            _id
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
                username
            }
            comments {
                _id
                commentText
                commentAuthor {
                    username
                }
            }
            createdAt
            updatedAt
        }
    }
`;

export const QUERY_ME = gql `
    query me {
        me {
            _id
            username
            email
            reviews {
                _id
                description
                reviewType
                location
                severity
                verified
                createdAt
                updatedAt
            }
        }
    }
`;

export const QUERY_REVIEWS_BY_USER = gql `
    query getReviewsByUser($username: String!) {
        reviewsByUser(username: $username) {
            _id
            description
            reviewType
            location {
                address
            }
            severity
            reviewedBy {
                username
            }
            createdAt
            }
        }
    }
`;

export const QUERY_REVIEWS_BY_LOCATION = gql `
    query getReviewsByLocation($longitude: number, latitude: number, distance: number) {
        getReviewsByLocation(longitude: $longitude, latitude: $latitude, distance: $distance) {
            _id
            description
            reviewType
            location {
                address
                coordinates
            }
            severity
            reviewedBy {
                username
            }
            createdAt
        }
    }
`;

