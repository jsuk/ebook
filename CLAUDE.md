# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ebook analysis and bibliography research project focused on Japanese academic texts. The main application is a web-based interface (`index.html`) that queries SPARQL endpoints to display bibliographic information about authors and their works.

## Key Architecture

### Frontend (`index.html`)
- Single-page application with vanilla JavaScript
- Uses IndexedDB for client-side author caching
- Queries two SPARQL endpoints:
  - JPSearch (https://jpsearch.go.jp/rdf/sparql) - for bibliographic data
  - NDL Auth (https://id.ndl.go.jp/auth/ndla/sparql) - for author search

### Core Functionality
- **Author Selection**: Dropdown with predefined Japanese authors (Karatani Kojin, Yoshimoto Takaaki, etc.)
- **Dynamic Author Search**: Search NDL database for authors by name, cache results in IndexedDB
- **Work Display**: Shows publications with dates, titles, and links organized in a table
- **Caching System**: Persistent author data using IndexedDB with clear cache functionality

### Data Processing Scripts
- `e.py`: Extract text content from EPUB/PDF files using textract library
- `tokenize.sh`: Tokenize text files by splitting on punctuation/whitespace
- `search.sh`: Grep-based text search within extracted content
- `gpt.sh`: Shell script for querying GPT-4 API with stdin/args input
- `jpsearch.sh`: Execute SPARQL queries against JPSearch endpoint

### SPARQL Queries
- `author_search_by_name.sparql`: Search for persons by name using FOAF vocabulary
- `karatani_jpsearch.sparql`: Example query for Karatani Kojin's publications with date grouping

## Text Files
- Various Japanese text extracts from academic works (TheStructureOfWorldHistory.txt, YoshimotoAndKaratani.txt, etc.)
- Tokenized versions for analysis (tokensBySed.txt, tokensByXargs.txt)

## Development Notes

### Working with SPARQL Queries
The application constructs complex SPARQL queries dynamically. When modifying queries:
- Maintain PREFIX declarations for chname, owl, schema namespaces
- Use GROUP_CONCAT for multiple values (revisions, links)
- Sort by publication date for chronological display

### IndexedDB Schema
- Database: 'author_db' 
- Store: 'authors' with keyPath 'id'
- Schema version tracking via CACHE_SCHEMA_VERSION constant

### JavaScript Error Handling
The application includes global error capture that displays JavaScript errors in a visible container for debugging.

## External Dependencies
- textract (Python): For extracting text from EPUB/PDF files
- jq: JSON processing in shell scripts
- curl: HTTP requests to SPARQL endpoints

## No Build Process
This is a static web application with no build system, package management, or testing framework. The HTML file can be opened directly in a browser.