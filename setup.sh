#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
#  setup.sh  —  Download dependencies and build Main.java
#  Run once: chmod +x setup.sh && ./setup.sh
# ─────────────────────────────────────────────────────────────────
set -e

MAVEN="https://repo1.maven.org/maven2"
LIB="./lib"
mkdir -p "$LIB" uploads public

echo "→ Downloading dependencies..."

download() {
  local url="$1"
  local dest="$LIB/$(basename $url)"
  if [ ! -f "$dest" ]; then
    echo "  $dest"
    curl -fsSL "$url" -o "$dest"
  else
    echo "  $dest (cached)"
  fi
}

# PostgreSQL JDBC
download "$MAVEN/org/postgresql/postgresql/42.7.3/postgresql-42.7.3.jar"

# HikariCP + SLF4J
download "$MAVEN/com/zaxxer/HikariCP/5.1.0/HikariCP-5.1.0.jar"
download "$MAVEN/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar"
download "$MAVEN/org/slf4j/slf4j-simple/2.0.13/slf4j-simple-2.0.13.jar"

# JJWT
download "$MAVEN/io/jsonwebtoken/jjwt-api/0.12.6/jjwt-api-0.12.6.jar"
download "$MAVEN/io/jsonwebtoken/jjwt-impl/0.12.6/jjwt-impl-0.12.6.jar"
download "$MAVEN/io/jsonwebtoken/jjwt-jackson/0.12.6/jjwt-jackson-0.12.6.jar"

# Jackson (required by jjwt-jackson)
download "$MAVEN/com/fasterxml/jackson/core/jackson-core/2.17.1/jackson-core-2.17.1.jar"
download "$MAVEN/com/fasterxml/jackson/core/jackson-databind/2.17.1/jackson-databind-2.17.1.jar"
download "$MAVEN/com/fasterxml/jackson/core/jackson-annotations/2.17.1/jackson-annotations-2.17.1.jar"

# Gson
download "$MAVEN/com/google/code/gson/gson/2.11.0/gson-2.11.0.jar"

echo ""
echo "→ Compiling Main.java..."
javac -cp "lib/*" Main.java

echo ""
echo "✓ Build complete. Run with:"
echo "  java -cp 'lib/*:.' Main"
echo ""
echo "⚠️  Make sure you have updated the 4 constants in Main.java before running:"
echo "  DB_URL, DB_USER, DB_PASSWORD, JWT_SECRET"
