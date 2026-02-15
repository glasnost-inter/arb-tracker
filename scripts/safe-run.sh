#!/bin/bash

# Configuration
DB_FILE="prisma/dev.db"
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/dev_backup_${TIMESTAMP}.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup
if [ -f "$DB_FILE" ]; then
    echo "Creating backup of $DB_FILE to $BACKUP_FILE..."
    cp "$DB_FILE" "$BACKUP_FILE"
    if [ $? -eq 0 ]; then
        echo "Backup successful."
    else
        echo "Backup failed! Aborting."
        exit 1
    fi
else
    echo "No database file found at $DB_FILE. Skipping backup."
fi

# Execute the requested command
if [ $# -gt 0 ]; then
    echo "Executing: $@"
    "$@"
else
    echo "No command provided to execute after backup."
fi
