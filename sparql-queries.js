/**
 * SPARQL Queries for Ebook Analysis Application
 * Contains all SPARQL query templates and utilities
 */

// SPARQL Query Templates
const SparqlQueries = {
  
  // JPSearch (Japanese Search) Queries
  jpSearch: {
    /**
     * Get works by author using schema:creator
     * @param {string} authorId - The author URI
     * @returns {string} Complete SPARQL query
     */
    worksByAuthor: (authorId) => {
      if (!authorId || authorId === 'undefined' || authorId === 'null') {
        console.warn('JPSearch worksByAuthor called with invalid authorId:', authorId);
        return `-- ERROR: Invalid author ID provided to JPSearch worksByAuthor query --`;
      }
      return `
PREFIX schema: <http://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?s ?o ?d ?link WHERE {
  ?s schema:creator <${authorId}> .
  ?s rdfs:label ?o .
  OPTIONAL { ?s schema:datePublished ?d }
  OPTIONAL { ?s schema:url ?link }
}
ORDER BY ?d ?o
LIMIT 50`;
    },

    /**
     * Enhanced works query with additional metadata
     * @param {string} authorId - The author URI
     * @returns {string} Complete SPARQL query
     */
    worksWithMetadata: (authorId) => `
PREFIX schema: <http://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dcterms: <http://purl.org/dc/terms/>
SELECT DISTINCT ?s ?title ?date ?link ?publisher ?isbn WHERE {
  ?s schema:creator <${authorId}> .
  ?s rdfs:label ?title .
  OPTIONAL { ?s schema:datePublished ?date }
  OPTIONAL { ?s schema:url ?link }
  OPTIONAL { ?s schema:publisher ?publisher }
  OPTIONAL { ?s schema:isbn ?isbn }
}
ORDER BY ?date ?title
LIMIT 50`
  },

  // NDL (National Diet Library) Queries  
  ndl: {
    /**
     * Search authors by name in NDL
     * @param {string} authorName - The author name to search
     * @returns {string} Complete SPARQL query
     */
    authorByName: (authorName) => `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT DISTINCT ?s ?label WHERE {
  ?s rdf:type foaf:Person .
  ?s rdfs:label ?label .
  FILTER(?label = "${authorName}")
}
LIMIT 20`,

    /**
     * Search authors by name with CONTAINS
     * @param {string} authorName - The author name to search
     * @returns {string} Complete SPARQL query
     */
    authorByNameContains: (authorName) => `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT DISTINCT ?s ?label WHERE {
  ?s rdf:type foaf:Person .
  ?s rdfs:label ?label .
  FILTER(CONTAINS(?label, "${authorName}"))
}
LIMIT 20`
  },

  // KNL (Korean National Library) Queries
  knl: {
    /**
     * Get works by author in KNL
     * @param {string} authorId - The KNL author URI
     * @returns {string} Complete SPARQL query
     */
    worksByAuthor: (authorId) => {
      if (!authorId || authorId === 'undefined' || authorId === 'null') {
        console.warn('KNL worksByAuthor called with invalid authorId:', authorId);
        return `-- ERROR: Invalid author ID provided to KNL worksByAuthor query --`;
      }
      return `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dcterms: <http://purl.org/dc/terms/> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX nlon: <http://lod.nl.go.kr/ontology/>
PREFIX bibo: <http://purl.org/ontology/bibo/>
SELECT ?work ?title ?issued ?isbn WHERE { 
    ?work dcterms:creator <${authorId}> ;
          dcterms:title ?title ;
          dcterms:issued ?issued .
    OPTIONAL { ?work bibo:isbn ?isbn }
}
ORDER BY ?issued ?title
LIMIT 50`;
    },

    /**
     * Simple author search by name (exact match) - WORKING PATTERN
     * @param {string} authorName - The author name to search (Korean)
     * @returns {string} Complete SPARQL query
     */
    authorByName: (authorName) => `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX nlon: <http://lod.nl.go.kr/ontology/>
SELECT DISTINCT ?s ?label WHERE { 
    ?s rdf:type nlon:Author .
    ?s rdfs:label ?label .
    FILTER(?label = "${authorName}")
}
LIMIT 20`,

    /**
     * Multiple author search (OR conditions) - WORKING PATTERN
     * @param {string[]} authorNames - Array of author names
     * @returns {string} Complete SPARQL query
     */
    multipleAuthors: (authorNames) => {
      const filterConditions = authorNames.map(name => `?label = "${name}"`).join(' || ');
      return `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX nlon: <http://lod.nl.go.kr/ontology/>
SELECT ?s ?label WHERE { 
    ?s rdf:type nlon:Author .    
    ?s rdfs:label ?label .
    FILTER(${filterConditions})
}
LIMIT 20`;
    },

    /**
     * Get author details with enhanced metadata
     * @param {string} authorId - The KNL author URI
     * @returns {string} Complete SPARQL query
     */
    authorDetails: (authorId) => `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX nlon: <http://lod.nl.go.kr/ontology/>
PREFIX schema: <http://schema.org/>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
SELECT DISTINCT ?s ?label ?jobTitle ?fieldOfActivity ?gender ?associatedLanguage WHERE { 
    VALUES ?s { <${authorId}> }
    ?s rdf:type nlon:Author .
    ?s rdfs:label ?label .
    OPTIONAL { ?s schema:jobTitle ?jobTitle }
    OPTIONAL { ?s nlon:fieldOfActivity ?fieldOfActivity }
    OPTIONAL { ?s schema:gender ?gender }
    OPTIONAL { ?s nlon:associatedLanguage ?associatedLanguage }
}
LIMIT 1`
  }
};

// Query validation and utilities
const SparqlUtils = {
  /**
   * Validate if a query contains required variables
   * @param {string} query - The SPARQL query
   * @param {string[]} requiredVars - Required variable names
   * @returns {boolean} True if all variables are present
   */
  validateQuery(query, requiredVars = []) {
    return requiredVars.every(varName => 
      query.includes(`?${varName}`) || query.includes(`?${varName} `)
    );
  },

  /**
   * Extract author ID from query
   * @param {string} query - The SPARQL query
   * @returns {string|null} The author ID or null if not found
   */
  extractAuthorId(query) {
    // Look for common author ID patterns in the query body (not in PREFIX declarations)
    const patterns = [
      // JPSearch pattern: ?s schema:creator <author_id>
      /\?\w+\s+schema:creator\s+<([^>]+)>/,
      // KNL works pattern: ?work dcterms:creator <author_id>
      /\?\w+\s+dcterms:creator\s+<([^>]+)>/,
      // Direct VALUES pattern: VALUES ?s { <author_id> }
      /VALUES\s+\?\w+\s+\{\s*<([^>]+)>/,
      // General author URI pattern (backup - look for id.ndl.go.jp or lod.nl.go.kr URIs)
      /<(http:\/\/id\.ndl\.go\.jp\/auth\/entity\/[^>]+)>/,
      /<(http:\/\/lod\.nl\.go\.kr\/resource\/[^>]+)>/
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  },

  /**
   * Check if query is for KNL endpoint
   * @param {string} query - The SPARQL query
   * @returns {boolean} True if it's a KNL query
   */
  isKNLQuery(query) {
    return query.includes('nlon:') || query.includes('lod.nl.go.kr');
  },

  /**
   * Check if query is for JPSearch endpoint
   * @param {string} query - The SPARQL query
   * @returns {boolean} True if it's a JPSearch query
   */
  isJPSearchQuery(query) {
    return query.includes('schema:creator') && !this.isKNLQuery(query);
  },

  /**
   * Get query type description
   * @param {string} query - The SPARQL query
   * @returns {string} Description of the query type
   */
  getQueryType(query) {
    if (this.isKNLQuery(query)) {
      if (query.includes('dcterms:creator')) return 'KNL Works Search';
      if (query.includes('nlon:Author')) return 'KNL Author Search';
      return 'KNL Query';
    }
    if (this.isJPSearchQuery(query)) {
      return 'JPSearch Works Search';
    }
    if (query.includes('foaf:Person')) {
      return 'NDL Author Search';
    }
    return 'Unknown Query Type';
  }
};

// Pre-defined query sets for common searches
const QuerySets = {
  // Karatani Kojin search set
  karatanieSearch: {
    jpSearch: SparqlQueries.jpSearch.worksByAuthor('http://id.ndl.go.jp/auth/entity/00026849'),
    knl: SparqlQueries.knl.worksByAuthor('http://lod.nl.go.kr/resource/KAC200203105')
  },

  // Park Tae-woong (박태웅) search set
  parkTaeWoongSearch: {
    knlAuthorSearch: SparqlQueries.knl.authorByName('박태웅'),
    knlMultipleIds: SparqlQueries.knl.multipleAuthors(['박태웅', '朴泰雄'])
  },

  // Multi-author search for testing
  testSearch: {
    knlMultiAuthors: SparqlQueries.knl.multipleAuthors([
      '가라타니 고진', 
      '유시민', 
      '박태웅'
    ])
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { SparqlQueries, SparqlUtils, QuerySets };
} else {
  // Browser environment - attach to window
  window.SparqlQueries = SparqlQueries;
  window.SparqlUtils = SparqlUtils;
  window.QuerySets = QuerySets;
}