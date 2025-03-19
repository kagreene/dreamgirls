const typeDefs = `#graphql
    # Types
    type User {
        _id: ID!
        username: String!
        email: String!
        reviews: [Review]
    }  
    
    type Auth {
        token: ID!
        user: User
    }
    
    type Comment {
        _id: ID
        commentText: String
        commentAuthor: User
        createdAt: String
    }
    
    type Location {
        type: String!
        coordinates: [Float]!
        address: String
    }
    
    type Review {
        _id: String!
        description: String!
        reviewType: String!
        location: Location!
        severity: Int!
        verified: Boolean
        upvotes: Int
        downvotes: Int
        voteRatio: Float
        reviewedBy: User!
        comments: [Comment]
        createdAt: String
        updatedAt: String
    }
        
    # Inputs
    input UserInput {
        username: String!
        email: String!
    }

    input LocationInput {
        type: String!
        coordinates: [Float]!
        address: String
    }
    
    input ReviewInput {
        title: String!
        description: String!
        reviewType: String!
        location: LocationInput!
        severity: Int!
    }
    
    input CommentInput {
        commentText: String!
    }

    # Queries
    type Query {
        me: User
        users: [User]
        user(username: String!): User
        
        reviews: [Review]
        review(reviewId: ID!): Review}
        reviewsByUser(username: String!): [Review]
        reviewsByLocation(longitude: Float!, latitude: Float!, distance: Int = 5000): [Review]
    }

    # Mutations
    type Mutation {
        # Auth mutations
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
    
        # Review mutations
        addReview(reviewData: ReviewInput!): Review
        updateReview(reviewId: ID!, reviewData: ReviewInput!): Review 
        removeReview(reviewId: ID!): Review
        verifyReview(reviewId: ID!): Review
   
        # Vote mutations
        upvoteReview(reviewId: ID!): Review
        downvoteReview(reviewId: ID!): Review
   
        # Comment mutations
        addComment(reviewId: ID!, commentText: String!): Review
        removeComment(reviewId: ID!, commentId: ID!): Review
    }
`;

export default typeDefs;