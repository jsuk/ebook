# KNL SPARQL Endpoint Limitations

## Tested Functions (2025-08-10)

The Korean National Library (KNL) SPARQL endpoint at `https://lod.nl.go.kr/sparql` has very limited function support compared to other SPARQL endpoints.

### ✅ Supported Functions

| Function | Status | Example | Notes |
|----------|--------|---------|-------|
| Exact Match | ✅ Working | `FILTER(?label = "가라타니 고진")` | Basic equality comparison |
| Multiple OR | ✅ Working | `FILTER(?label = "가라타니 고진" \|\| ?label = "가라타니")` | Boolean OR conditions |

### ❌ Not Supported Functions (HTTP 500 errors)

| Function | Status | Example | Error |
|----------|--------|---------|-------|
| REGEX | ❌ HTTP 500 | `FILTER(REGEX(?label, "가라타니"))` | Internal Server Error |
| CONTAINS | ❌ HTTP 500 | `FILTER(CONTAINS(?label, "가라타니"))` | Internal Server Error |
| STRSTARTS | ❌ HTTP 500 | `FILTER(STRSTARTS(?label, "가라타니"))` | Internal Server Error |
| STRENDS | ❌ HTTP 500 | `FILTER(STRENDS(?label, "고진"))` | Internal Server Error |

## Implications for Partial Search

### The Problem
- Traditional SPARQL partial search relies on `CONTAINS`, `STRSTARTS`, or `REGEX` functions
- KNL doesn't support any of these functions
- This makes true partial/fuzzy search impossible with KNL

### Current Solution
1. **Predefined Completions**: Maintain a hardcoded list of known name completions
   ```javascript
   const knownCompletions = {
     '가라타니': ['가라타니 고진'],
     '박태웅': ['박태웅'],
     '유시민': ['유시민']
   };
   ```

2. **Multiple OR Queries**: Use exact matches with OR conditions
   ```sparql
   FILTER(?label = "가라타니 고진" || ?label = "가라타니")
   ```

### Alternative Solutions

#### Option 1: Client-Side Filtering
- Fetch all authors: `SELECT ?s ?label WHERE { ?s rdf:type nlon:Author . ?s rdfs:label ?label . }`
- Filter results client-side using JavaScript string methods
- **Pros**: True partial search capability
- **Cons**: Large data transfer, slower initial load

#### Option 2: Expanded Completion Dictionary
- Manually curate a comprehensive list of Korean author names
- Include common variations and partial matches
- **Pros**: Fast, accurate for known authors
- **Cons**: Requires manual maintenance, limited to known names

#### Option 3: Hybrid Approach (Recommended)
- Use predefined completions for known authors
- Fallback to exact match for unknown terms
- Provide user feedback about KNL limitations

## Test Results (가라타니)

```
exact       : ✅ SUPPORTED (0 results)     // No exact match for partial "가라타니"
regex       : ❌ NOT SUPPORTED (HTTP 500)   // Function not available
contains    : ❌ NOT SUPPORTED (HTTP 500)   // Function not available
strstarts   : ❌ NOT SUPPORTED (HTTP 500)   // Function not available
strends     : ❌ NOT SUPPORTED (HTTP 500)   // Function not available
multipleOr  : ✅ SUPPORTED (1 results)     // Found "가라타니 고진"
```

## Recommendations

1. **Accept the limitation**: KNL partial search is inherently limited
2. **Expand completion dictionary**: Add more known Korean author name patterns
3. **Provide user guidance**: Inform users that KNL requires more complete names
4. **Use other endpoints**: NDL and JPSearch have better SPARQL function support

## Code Impact

The following functions in `sparql-queries.js` are affected:
- `authorByPartialName()`: Limited to predefined completions
- `authorFuzzySearch()`: Reduced to exact match only
- `authorByContains()`: Reduced to predefined completions

## Testing

Run `node test_knl_sparql_functions.js` to verify current function support.