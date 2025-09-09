.PHONY: build-web clean clean-ios get test format lint format-lint build-web-clean setup-hooks

# Message handling functions
define echo-info
	@echo "\033[1;34m[INFO]\033[0m $(1)"
endef

define echo-success
	@echo "\033[1;32m[SUCCESS]\033[0m $(1)"
endef

define echo-error
	@echo "\033[1;31m[ERROR]\033[0m $(1)"
endef

# Build web version with embed flag
build-web-embed:
	$(call echo-info, "Building web version...")
	@flutter build web --dart-define="RUNNING_ON_EMBED=true" --quiet
	$(call echo-info, "Copying assets...")
	@mkdir -p ~/Desktop/public/web
	@rsync -aq --exclude='index.html' --exclude='assets' ./build/web/ ~/Desktop/public/
	@rsync -aq ./build/web/assets/ ~/Desktop/public/web/assets/
	$(call echo-success, "Build completed and assets copied to ~/Desktop/public")

# Clean the project
clean:
	$(call echo-info, "Cleaning project...")
	flutter clean
	$(call echo-success, "Project cleaned successfully")

# Clean the iOS project
clean-ios:
	$(call echo-info, "Cleaning iOS project...")
	flutter clean
	cd ios && rm -rf Podfile.lock
	cd ios && rm -rf Pods
	flutter pub get
	cd ios && pod install --repo-update --verbose
	$(call echo-success, "iOS project cleaned successfully")

# Get dependencies
get:
	$(call echo-info, "Getting dependencies...")
	flutter pub get
	$(call echo-success, "Dependencies updated successfully")

# Run tests
test:
	$(call echo-info, "Running tests...")
	flutter test
	$(call echo-success, "Tests completed successfully")

# Format code
format:
	$(call echo-info, "Formatting code...")
	dart format lib/ test/
	$(call echo-success, "Code formatted successfully")

# Run linter
lint:
	$(call echo-info, "Running linter...")
	flutter analyze
	$(call echo-success, "Lint check completed")

format-lint:
	$(call echo-info, "Formatting and linting code...")
	dart format --set-exit-if-changed . && flutter analyze .
	$(call echo-success, "Formatting and linting completed")

# Build web version with embed flag and clean first
build-web-embed-clean: clean get build-web-embed 

# Setup hooks
setup-hooks:
	$(call echo-info, "Setting up hooks...")
	curl -s https://raw.githubusercontent.com/scoutredeem/scaffolding/refs/heads/main/ops/install-hooks.sh > install-hooks.sh
	chmod +x install-hooks.sh
	./install-hooks.sh
	$(call echo-success, "Hooks installed successfully")
	rm -f install-hooks.sh
	$(call echo-success, "Setup file cleaned up")
