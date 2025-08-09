# Academic Bibliography Research Tool

A web-based application for exploring and analyzing academic literature, with a focus on works by East Asian scholars and thinkers. The tool provides an interactive interface to query bibliographic databases and analyze extracted text content.

## Features

### 📚 Interactive Bibliography Browser
- **Author Selection**: Choose from predefined authors or search for new ones
- **Dynamic Search**: Query the National Diet Library (NDL) database for authors by name
- **Publication Timeline**: View works chronologically with publication dates and revisions
- **Responsive Design**: Optimized for both mobile and desktop devices

### 🔍 Text Analysis Tools
- **Content Extraction**: Extract text from EPUB and PDF files
- **Text Tokenization**: Break down texts into analyzable components  
- **Search Functionality**: Grep-based search within extracted content
- **AI Integration**: GPT-4 API integration for text analysis

### 💾 Data Management
- **IndexedDB Caching**: Client-side storage for author information
- **SPARQL Queries**: Direct queries to JPSearch and NDL endpoints
- **Export Capabilities**: Various text processing and export formats

## Quick Start

1. **Open the Application**
   ```bash
   # Simply open index.html in a web browser
   open index.html
   ```

2. **Select an Author**
   - Use the dropdown to select a predefined author
   - Or search for authors by name using the search field

3. **View Publications**
   - Browse the author's works in the results table
   - Click links to view original sources
   - Publications are sorted chronologically

## Architecture

### Frontend (`index.html`)
- Single-page vanilla JavaScript application
- Responsive CSS with mobile-first design
- IndexedDB for client-side caching
- Real-time SPARQL query execution

### Data Sources
- **JPSearch**: `https://jpsearch.go.jp/rdf/sparql` - Japanese cultural heritage database
- **NDL Authority**: `https://id.ndl.go.jp/auth/ndla/sparql` - National Diet Library authority records

### Processing Scripts
- `e.py` - Text extraction from EPUB/PDF using textract
- `search.sh` - Text search within extracted content
- `tokenize.sh` - Text tokenization and preprocessing
- `gpt.sh` - GPT-4 API integration for analysis
- `jpsearch.sh` - SPARQL query execution

## SPARQL Queries

The application uses two main types of SPARQL queries:

### Author Search
```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?s ?name ?label ?birthDate ?deathDate
WHERE {
  ?s rdf:type foaf:Person;
     foaf:name ?name.
  FILTER regex(?name, "search_term", "i")
}
```

### Publication Retrieval
```sparql
PREFIX schema: <http://schema.org/>
SELECT min(?d) as ?published ?o as ?title
WHERE {
  ?s schema:creator <author_id>;
     rdfs:label ?o;
     schema:datePublished ?d
}
ORDER BY ?published ?title
```

## Dependencies

### Python
- `textract` - Text extraction from various document formats

### System Tools
- `curl` - HTTP requests to SPARQL endpoints
- `jq` - JSON processing in shell scripts
- `grep`/`sed` - Text processing and search

### Browser Requirements
- Modern browser with IndexedDB support
- JavaScript enabled
- Internet connection for SPARQL queries

## Contributing

This project focuses on academic literature research. When contributing:

1. Maintain the existing SPARQL query patterns
2. Follow the responsive design principles
3. Test on both mobile and desktop devices
4. Ensure compatibility with the JPSearch and NDL endpoints

## Featured Authors

This tool includes works by influential scholars and thinkers:
- **Karatani Kojin (柄谷行人)** - Japanese philosopher and literary critic
- **Yoshimoto Takaaki (吉本隆明)** - Japanese poet, philosopher, and literary critic
- **Chon Kyongmo** - Korean scholar
- **Lee O-Young** - Korean cultural critic
- **Kim Yongoak** - Korean academic researcher
- **Ryu Shimin** - Author, activist and former politician

The application provides tools for exploring the bibliographic relationships and textual content of these authors' works within the broader context of East Asian academic discourse.