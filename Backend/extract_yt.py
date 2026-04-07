import json

try:
    with open('playlist.json', 'r', encoding='utf-16') as f:
        lines = f.readlines()
    
    arr = [json.loads(line) for line in lines if line.strip()]
    
    with open('playlist_extracted.json', 'w', encoding='utf-8') as f:
        json.dump([{'title': item['title'], 'id': item['id']} for item in arr], f, indent=4)
        
    print(f"Extracted {len(arr)} playlist items.")
except Exception as e:
    print(e)
