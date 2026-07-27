import zcatalyst_sdk
print("Imported successfully!")
try:
    app = zcatalyst_sdk.initialize()
    print("Initialized successfully!")
except Exception as e:
    print(f"Failed to initialize: {e}")
