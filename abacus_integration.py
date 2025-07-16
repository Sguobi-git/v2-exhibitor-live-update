# abacus_integration.py
from abacusai import ApiClient
import pandas as pd

class AbacusAIManager:
    def __init__(self, api_key: str):
        self.client = ApiClient(api_key)
        self.project_id = "7573ebd78"
        
    def get_real_data(self):
        """Get data using the correct API methods"""
        try:
            print("🔍 Getting datasets...")
            datasets = self.client.list_datasets()
            
            for dataset in datasets:
                print(f"📊 Dataset ID: {dataset.dataset_id}")
                
                # Try to describe the dataset to get more info
                try:
                    dataset_info = self.client.describe_dataset(dataset.dataset_id)
                    print(f"✅ Dataset described successfully")
                    
                    # Try to get the schema
                    schema = self.client.get_dataset_schema(dataset.dataset_id)
                    print(f"📋 Schema: {schema}")
                    
                except Exception as e:
                    print(f"❌ Dataset describe failed: {e}")
            
            print("\n🔍 Getting feature groups...")
            feature_groups = self.client.list_feature_groups()
            
            for fg in feature_groups:
                if hasattr(fg, 'table_name') and 'exhibitor' in fg.table_name.lower():
                    print(f"🎯 Found feature group: {fg.table_name}")
                    print(f"   ID: {fg.feature_group_id}")
                    
                    # Try different methods to get data
                    try:
                        # Method 1: Try get_feature_group_data
                        if hasattr(self.client, 'get_feature_group_data'):
                            data = self.client.get_feature_group_data(fg.feature_group_id)
                            print(f"✅ Method 1 success: {type(data)}")
                            return data
                    except Exception as e:
                        print(f"❌ Method 1 failed: {e}")
                    
                    try:
                        # Method 2: Try describe_feature_group
                        if hasattr(self.client, 'describe_feature_group'):
                            fg_info = self.client.describe_feature_group(fg.feature_group_id)
                            print(f"✅ Feature group info: {fg_info}")
                    except Exception as e:
                        print(f"❌ Method 2 failed: {e}")
                    
                    try:
                        # Method 3: Try through dataset
                        if hasattr(fg, 'dataset_id'):
                            print(f"🔗 Trying through dataset: {fg.dataset_id}")
                            # Look for data export methods
                            export_methods = [m for m in dir(self.client) if 'export' in m.lower() or 'data' in m.lower()]
                            print(f"📤 Available data methods: {export_methods[:10]}...")  # Show first 10
                    except Exception as e:
                        print(f"❌ Method 3 failed: {e}")
            
            return None
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def try_chatllm_approach(self):
        """Since this is a ChatLLM project, try that approach"""
        try:
            print("\n🤖 Trying ChatLLM approach...")
            
            # Look for ChatLLM methods
            chat_methods = [m for m in dir(self.client) if 'chat' in m.lower()]
            print(f"💬 Available chat methods: {chat_methods}")
            
            # Try to create a conversation to query the data
            if hasattr(self.client, 'create_chatllm_conversation'):
                print("🔄 Creating ChatLLM conversation...")
                conversation = self.client.create_chatllm_conversation(self.project_id)
                print(f"✅ Conversation created: {conversation.conversation_id}")
                
                # Try to get a response about the data
                if hasattr(self.client, 'get_chatllm_response'):
                    print("📝 Asking for data...")
                    response = self.client.get_chatllm_response(
                        conversation.conversation_id,
                        "Show me the first 5 rows from the exhibitor_order_data as JSON format"
                    )
                    print(f"✅ Response: {response}")
                    return response
                    
        except Exception as e:
            print(f"❌ ChatLLM approach failed: {e}")
        
        return None

# Test script
if __name__ == "__main__":
    # Put your real API key here
    api_key = "s2_440d8b6da4094a9badee296fd7e6500d"
    
    manager = AbacusAIManager(api_key)
    
    print("🚀 Trying Multiple Approaches...")
    print("=" * 50)
    
    # Try data access
    data = manager.get_real_data()
    
    # Try ChatLLM approach
    chat_response = manager.try_chatllm_approach()
    
    if data or chat_response:
        print("\n🎉 SUCCESS! Found a working approach!")
    else:
        print("\n🔍 Let's check what specific methods are available...")