import { UnprocessableEntityError } from '../errors/index.js';
import { widgetRepository } from '../repositories/widget.repository.js';
import { generateEmbedToken } from './embed-token.js';

export async function generateUniqueEmbedToken(maxAttempts = 10): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const token = generateEmbedToken();
    const exists = await widgetRepository.embedTokenExists(token);
    if (!exists) {
      return token;
    }
  }

  throw new UnprocessableEntityError('Unable to generate a unique embed token');
}
