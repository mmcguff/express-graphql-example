//Package Dependencies
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLFloat,
    GraphQLNonNull
} = require('graphql')
const app = express()

//Data//
const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' }
]

const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets',  authorId: 1, publisherId: 1, price: 9.99 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1, publisherId: 1, price: 9.99 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1, publisherId: 1, price: 9.99 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2, publisherId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2, publisherId: 2 },
    { id: 6, name: 'The Return of the King', authorId: 2, publisherId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3, publisherId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3, publisherId: 4 }
]

const publishers = [
    {id: 1, name: 'Random House Publishing'},
    {id: 2, name: 'Scholastic'},
    {id: 3, name: 'Penguin Publishing'},
    {id: 4, name: 'Osborne Books'},
]

//Type Defs And Resolvers//
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        publisherId: { type: GraphQLNonNull(GraphQLInt)},
        price: { type: GraphQLFloat},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        },
        publisher: {
            type: PublisherType,
            resolve: (book) => {
                return publishers.find(publisher => publisher.id === book.publisherId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents a author of a book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const PublisherType = new GraphQLObjectType({
    name: 'Publisher',
    description: 'name of a publisher',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
    })
})


//Root QueryType//
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A Single Book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All Books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of All Authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'A Single Author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        publisher: {
            type: PublisherType,
            description: 'A Single Publisher',
            args: {
                id: { type: GraphQLInt}
            },
            resolve: (parent, args) => publishers.find(publisher => publisher.id === args.id)
        }
    })
})

//Root MutationType//
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) },
                publisherId: { type: GraphQLNonNull(GraphQLInt) },
                price: { type: GraphQLFloat}
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name }
                authors.push(author)
                return author
            }
        }
    })
})

//schema
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))
app.listen(5000, () => console.log('Server Running'))