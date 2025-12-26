# backend/architecture.md

# Backend Architecture Design

## Overview
This document outlines the architecture for the Node.js backend, including the database schema for MongoDB and the GraphQL API structure.

## Database Schema

### User Schema
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
### Post Schema
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
## GraphQL API Structure

### Type Definitions
const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        id: ID!
        username: String!
        email: String!
        createdAt: String!
    }

    type Post {
        id: ID!
        title: String!
        content: String!
        author: User!
        createdAt: String!
    }

    type Query {
        users: [User]
        posts: [Post]
    }

    type Mutation {
        createUser(username: String!, email: String!, password: String!): User
        createPost(title: String!, content: String!, author: ID!): Post
    }
`;

module.exports = typeDefs;
### Resolvers
const User = require('./models/User');
const Post = require('./models/Post');

const resolvers = {
    Query: {
        users: async () => {
            try {
                return await User.find();
            } catch (error) {
                throw new Error('Error fetching users');
            }
        },
        posts: async () => {
            try {
                return await Post.find().populate('author');
            } catch (error) {
                throw new Error('Error fetching posts');
            }
        },
    },
    Mutation: {
        createUser: async (_, { username, email, password }) => {
            try {
                const user = new User({ username, email, password });
                await user.save();
                return user;
            } catch (error) {
                throw new Error('Error creating user');
            }
        },
        createPost: async (_, { title, content, author }) => {
            try {
                const post = new Post({ title, content, author });
                await post.save();
                return post;
            } catch (error) {
                throw new Error('Error creating post');
            }
        },
    },
};

module.exports = resolvers;
## Docker Configuration

### Dockerfile
dockerfile
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "index.js"]
### docker-compose.yml
yaml
version: '3.8'

services:
  mongo:
    image: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  api:
    build: .
    ports:
      - "4000:4000"
    depends_on:
      - mongo

volumes:
  mongo-data: