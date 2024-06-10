import express from 'express';
import { Book } from '../models/bookModel.js';
import upload from '../middleware/multer.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Route for Save a new Book
router.post('/', upload.single('image'), async (request, response) => {
  try {
    const { title, author, publishYear } = request.body;

    if (!title || !author || !publishYear) {
      return response.status(400).send({
        message: 'Send all required fields: title, author, publishYear',
      });
    }

    let imageUrl = '';
    if (request.file) {
      imageUrl = `${request.protocol}://${request.get('host')}/uploads/${request.file.filename}`;
    }

    const newBook = {
      title,
      author,
      publishYear,
      image: imageUrl,
    };

    const book = await Book.create(newBook);

    return response.status(201).send(book);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Get All Books from database
router.get('/', async (request, response) => {
  try {
    const books = await Book.find({});

    return response.status(200).json({
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Get One Book from database by id
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const book = await Book.findById(id);

    return response.status(200).json(book);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Update a Book
router.put('/:id', upload.single('image'), async (request, response) => {
  try {
    const { title, author, publishYear } = request.body;

    if (!title || !author || !publishYear) {
      return response.status(400).send({
        message: 'Send all required fields: title, author, publishYear',
      });
    }

    const { id } = request.params;

    let book = await Book.findById(id);
    if (!book) {
      return response.status(404).json({ message: 'Book not found' });
    }

    let imageUrl = book.image;
    if (request.file) {
      // Delete the old image file if it exists
      if (book.image) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', path.basename(book.image));
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }

      imageUrl = `${request.protocol}://${request.get('host')}/uploads/${request.file.filename}`;
    }

    const updatedData = {
      title,
      author,
      publishYear,
      image: imageUrl,
    };

    book = await Book.findByIdAndUpdate(id, updatedData, { new: true });

    return response.status(200).send({ message: 'Book updated successfully', book });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Delete a book
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const book = await Book.findById(id);

    if (!book) {
      return response.status(404).json({ message: 'Book not found' });
    }

    // Delete the image file if it exists
    if (book.image) {
      const imagePath = path.join(__dirname, '..', 'uploads', path.basename(book.image));
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    await Book.findByIdAndDelete(id);

    return response.status(200).send({ message: 'Book deleted successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;
