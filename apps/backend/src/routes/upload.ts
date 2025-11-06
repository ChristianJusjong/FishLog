import { FastifyInstance } from 'fastify';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateToken } from '../middleware/auth';
import { extractExifData, calculateImageHash } from '../utils/exif';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadRoutes(fastify: FastifyInstance) {
  // Upload image endpoint
  fastify.post('/upload/image', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      fastify.log.info({ userId: request.user?.userId }, 'Upload request received from user');

      const data = await request.file();

      if (!data) {
        fastify.log.warn('No file in upload request');
        return reply.code(400).send({ error: 'No file uploaded' });
      }

      fastify.log.info({
        filename: data.filename,
        mimetype: data.mimetype,
        encoding: data.encoding
      }, 'File received');

      // Validate file type
      if (!data.mimetype.startsWith('image/')) {
        fastify.log.warn({ mimetype: data.mimetype }, 'Invalid file type');
        return reply.code(400).send({ error: 'Only image files are allowed' });
      }

      // Convert buffer to base64
      const buffer = await data.toBuffer();
      fastify.log.info({ size: buffer.length }, 'File buffer size (bytes)');

      // Validate file size (max 5MB)
      if (buffer.length > 5 * 1024 * 1024) {
        fastify.log.warn({ size: buffer.length }, 'File too large');
        return reply.code(400).send({ error: 'File size exceeds 5MB limit' });
      }

      // Extract EXIF data
      fastify.log.info('Extracting EXIF data...');
      const exifData = await extractExifData(buffer);

      // Calculate image hash
      const imageHash = calculateImageHash(buffer);
      fastify.log.info({ hash: imageHash.substring(0, 16) }, 'Image hash calculated');

      const base64Image = `data:${data.mimetype};base64,${buffer.toString('base64')}`;

      // Check Cloudinary configuration
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        fastify.log.error('Cloudinary not configured');
        return reply.code(500).send({ error: 'Image upload service not configured' });
      }

      fastify.log.info('Uploading to Cloudinary...');

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'fishlog',
        resource_type: 'image',
      });

      fastify.log.info({ publicId: result.public_id }, 'Upload successful');

      return {
        url: result.secure_url,
        publicId: result.public_id,
        exifData,
        imageHash,
      };
    } catch (error) {
      fastify.log.error({ err: error }, 'Upload error');
      return reply.code(500).send({
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Delete image endpoint (optional - for cleanup)
  fastify.delete('/upload/image/:publicId', {
    preHandler: authenticateToken
  }, async (request, reply) => {
    try {
      const { publicId } = request.params as { publicId: string };

      // Decode the publicId (it comes URL encoded)
      const decodedPublicId = decodeURIComponent(publicId);

      await cloudinary.uploader.destroy(decodedPublicId);

      return { message: 'Image deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete image' });
    }
  });
}
