

# Stop MongoDB service
brew services stop mongodb/brew/mongodb-community

# Remove the lock file (common cause)
sudo rm -f /usr/local/var/mongodb/mongod.lock
sudo rm -f /tmp/mongodb-27017.sock

# For macOS specifically
sudo rm -f /opt/homebrew/var/mongodb/mongod.lock# sporty-urban-ecommerce
