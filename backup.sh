#!/bin/bash
# Lead Architect Standard Automated Backup Script
# SOC Compliance: Backup Process Identifier [ARBT-BACKUP-AUTO]
# Purpose: Deterministic Database Backup & Disaster Recovery

# Determine project root dynamically
PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$BACKUP_DIR/backup_log.txt"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="backup_$TIMESTAMP.sql.gz"

# Configuration
CONTAINER_NAME="ifglife-mysql"
DB_NAME="arb_tracker"
DB_USER="salman_architect"
DB_PASS="secure_password" # Stored locally for automation context

# Ensure backup directory exists (Deterministic Pathing)
mkdir -p "$BACKUP_DIR"

# Logging function with SOC Identification
log() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] [ARBT-BACKUP-AUTO] $1" >> "$LOG_FILE"
}

# 1. Informative Initialization
log "INIT: Starting Automated Backup Session [ID: $TIMESTAMP]"

# 2. Operational Guardrail: Check if container is running
if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    log "CRITICAL ERROR: MySQL Container '$CONTAINER_NAME' is NOT running. Process aborted."
    exit 1
fi

# 3. Automation: Execute mysqldump
# Note: Using gzip for compression as per 'sql.gz' requirement
log "EXEC: Running mysqldump from container..."
if ! docker exec $CONTAINER_NAME mysqldump --no-tablespaces -u$DB_USER -p$DB_PASS $DB_NAME 2>> "$LOG_FILE" | gzip > "$BACKUP_DIR/$BACKUP_FILE"; then
    log "CRITICAL ERROR: mysqldump execution failed. Check log for details."
    exit 1
fi

# 4. Operational Guardrail: Verify Integrity (No Destructive Action if check fails)
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ] && [ -s "$BACKUP_DIR/$BACKUP_FILE" ]; then
    FILE_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log "INTEGRITY CHECK PASS: Backup created successfully: $BACKUP_FILE ($FILE_SIZE)"
    
    # 5. Rotation Policy: Delete backups older than 7 days
    log "POLICY: Running 7-day rotation cleanup..."
    # Log deleted files for audit trail
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +7 -exec log "CLEAN: Rotating old backup: {}" \; -delete
    log "SESSION COMPLETE: Disaster Recovery point established."
else
    log "CRITICAL ERROR: Backup file $BACKUP_FILE is missing or 0 KB. Integrity check FAILED."
    # No further cleanup of old backups to prevent data loss in failure state
    rm -f "$BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi
