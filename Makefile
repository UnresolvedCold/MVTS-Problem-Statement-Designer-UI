# MVTS Problem Statement Designer Build Configuration
# This Makefile handles building UI, server, and packaging

# Variables
UI_DIR = ui/mvts-problem-statement-generator
SERVER_DIR = server
TARGET_DIR = target
BUILD_DIR = $(UI_DIR)/build
SERVER_TARGET_DIR = $(SERVER_DIR)/target
JAR_NAME = MVTSProblemStatementDesigner-1.0-SNAPSHOT.jar

# Default target
.DEFAULT_GOAL := all

# Create target directory
$(TARGET_DIR):
	@echo "Creating target directory..."
	@mkdir -p $(TARGET_DIR)

# Clean everything
clean:
	@echo "Cleaning target directory..."
	@rm -rf $(TARGET_DIR)
	@echo "Cleaning UI build..."
	@cd $(UI_DIR) && rm -rf build node_modules/.cache
	@echo "Cleaning server target..."
	@cd $(SERVER_DIR) && mvn clean

# Install UI dependencies
ui-deps:
	@echo "Installing UI dependencies..."
	@cd $(UI_DIR) && npm install

# Build UI only (no tar)
ui: $(TARGET_DIR) ui-deps
	@echo "Building UI..."
	@cd $(UI_DIR) && npm run build
	@echo "Copying UI build to target directory..."
	@cp -r $(BUILD_DIR) $(TARGET_DIR)/
	@echo "UI build completed!"

# Build server only (no tar)
server: $(TARGET_DIR)
	@echo "Building server..."
	@cd $(SERVER_DIR) && mvn clean install
	@echo "Copying server jar to target directory..."
	@cp $(SERVER_TARGET_DIR)/$(JAR_NAME) $(TARGET_DIR)/
	@echo "Server build completed!"

# Create tar file
tar: $(TARGET_DIR)
	@echo "Creating tar file..."
	@cd $(TARGET_DIR) && tar -czf pss.tar.gz *
	@echo "Tar file created!"

# Clean, build everything, and create tar
all: clean ui server tar
	@echo "Complete build finished!"
	@echo "Files in target directory:"
	@ls -la $(TARGET_DIR)

# Help target
help:
	@echo "Available targets:"
	@echo "  all     - Clean, build UI and server, create tar file"
	@echo "  ui      - Build UI only (no tar)"
	@echo "  server  - Build server only (no tar)"
	@echo "  clean   - Clean all build artifacts"
	@echo "  tar     - Create tar file from target directory"
	@echo "  help    - Show this help message"

.PHONY: all ui server clean tar help ui-deps