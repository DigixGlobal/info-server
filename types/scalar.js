const BigNumber = require('bignumber.js');
const { GraphQLScalarType, Kind } = require('graphql');
const { gql } = require('apollo-server-express');

const typeDef = gql`
  scalar EthAddress
  scalar BigNumber
  scalar Timestamp
`;

const resolvers = {
  EthAddress: new GraphQLScalarType({
    name: 'EthAddress',
    description: "The user's eth address represented as a `String`",
    serialize(value) {
      return value;
    },
    parseValue(value) {
      return value;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return ast.value;
      }

      return null;
    },
  }),
  BigNumber: new GraphQLScalarType({
    name: 'BigNumber',
    description: 'A big number float represented as a `String`',
    serialize(value) {
      return value.toString();
    },
    parseValue(value) {
      return new BigNumber(value);
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.FLOAT) {
        return new BigNumber(ast.value);
      }

      return null;
    },
  }),
  Timestamp: new GraphQLScalarType({
    name: 'Timestamp',
    description: 'Unix epoch timestamp as a `Integer`',
    serialize(date) {
      if (date instanceof Date) {
        return date.getTime();
      } if (!isNaN(date)) {
        return date;
      }
      return null;
    },
    parseValue(value) {
      try {
        return new Date(value);
      } catch (_error) {
        return null;
      }
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(parseInt(ast.value, 10));
      }

      if (ast.kind === Kind.STRING) {
        return this.parseValue(ast.value);
      }

      return null;
    },
  }),
};

module.exports = { resolvers, typeDef };
