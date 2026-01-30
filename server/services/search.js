const { Client } = require('@elastic/elasticsearch');

// Elasticsearch Service for full-text search
class SearchService {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.indexName = 'portfolio';
  }

  /**
   * Initialize Elasticsearch connection
   */
  async initialize() {
    try {
      if (!process.env.ELASTICSEARCH_URL) {
        console.log('⚠️ ELASTICSEARCH_URL not configured - search disabled (optional)');
        return false;
      }

      this.client = new Client({
        node: process.env.ELASTICSEARCH_URL,
        requestTimeout: 5000
      });

      // Test connection
      await this.client.info();
      console.log('✅ Elasticsearch connected');

      // Create index if not exists
      await this.createIndexIfNotExists();
      this.initialized = true;
      return true;
    } catch (error) {
      console.log('⚠️ Elasticsearch initialization failed (optional):', error.message);
      return false;
    }
  }

  /**
   * Create index with proper mappings
   */
  async createIndexIfNotExists() {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });

      if (!exists) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                type: { type: 'keyword' },
                title: { type: 'text', analyzer: 'standard' },
                content: { type: 'text', analyzer: 'standard' },
                url: { type: 'keyword' },
                tags: { type: 'keyword' },
                category: { type: 'keyword' },
                date: { type: 'date' },
                author: { type: 'keyword' },
                views: { type: 'integer' },
                featured: { type: 'boolean' }
              }
            }
          }
        });

        console.log(`📚 Created Elasticsearch index: ${this.indexName}`);
      }
    } catch (error) {
      console.error('❌ Index creation error:', error.message);
    }
  }

  /**
   * Index a document
   */
  async indexDocument(id, document) {
    if (!this.initialized) return false;

    try {
      await this.client.index({
        index: this.indexName,
        id,
        body: {
          ...document,
          indexed_at: new Date().toISOString()
        }
      });

      console.log(`✅ Document indexed: ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Index document error:', error.message);
      return false;
    }
  }

  /**
   * Search documents
   */
  async search(query, filters = {}) {
    if (!this.initialized) return [];

    try {
      const bool = {
        must: [
          {
            multi_match: {
              query,
              fields: ['title^2', 'content', 'tags'],
              fuzziness: 'AUTO'
            }
          }
        ]
      };

      // Add filters if provided
      if (Object.keys(filters).length > 0) {
        bool.filter = Object.entries(filters).map(([field, value]) => ({
          term: { [field]: value }
        }));
      }

      const response = await this.client.search({
        index: this.indexName,
        body: {
          query: { bool },
          size: 20,
          highlight: {
            fields: {
              title: {},
              content: {}
            }
          }
        }
      });

      return response.hits.hits.map(hit => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
        highlights: hit.highlight
      }));
    } catch (error) {
      console.error('❌ Search error:', error.message);
      return [];
    }
  }

  /**
   * Autocomplete suggestions
   */
  async getSuggestions(prefix) {
    if (!this.initialized) return [];

    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            match_phrase_prefix: {
              title: {
                query: prefix
              }
            }
          },
          size: 10,
          _source: ['title', 'url']
        }
      });

      return response.hits.hits.map(hit => ({
        title: hit._source.title,
        url: hit._source.url
      }));
    } catch (error) {
      console.error('❌ Suggestions error:', error.message);
      return [];
    }
  }

  /**
   * Update document
   */
  async updateDocument(id, updates) {
    if (!this.initialized) return false;

    try {
      await this.client.update({
        index: this.indexName,
        id,
        body: {
          doc: {
            ...updates,
            updated_at: new Date().toISOString()
          }
        }
      });

      console.log(`✅ Document updated: ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Update document error:', error.message);
      return false;
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id) {
    if (!this.initialized) return false;

    try {
      await this.client.delete({
        index: this.indexName,
        id
      });

      console.log(`🗑️ Document deleted: ${id}`);
      return true;
    } catch (error) {
      console.error('❌ Delete document error:', error.message);
      return false;
    }
  }

  /**
   * Get stats
   */
  async getStats() {
    if (!this.initialized) return null;

    try {
      const stats = await this.client.indices.stats({
        index: this.indexName
      });

      return {
        docs: stats.indices[this.indexName].primaries.docs,
        size: stats.indices[this.indexName].primaries.store.size_in_bytes
      };
    } catch (error) {
      console.error('❌ Get stats error:', error.message);
      return null;
    }
  }

  /**
   * Index portfolio projects
   */
  async indexProjects(projects) {
    if (!this.initialized) return false;

    try {
      for (const project of projects) {
        await this.indexDocument(project._id.toString(), {
          type: 'project',
          title: project.title,
          content: project.description,
          tags: project.technologies || [],
          url: `/project/${project._id}`,
          category: 'portfolio'
        });
      }

      console.log(`✅ Indexed ${projects.length} projects`);
      return true;
    } catch (error) {
      console.error('❌ Index projects error:', error.message);
      return false;
    }
  }

  /**
   * Close connection
   */
  async close() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Elasticsearch connection closed');
    }
  }
}

module.exports = new SearchService();
