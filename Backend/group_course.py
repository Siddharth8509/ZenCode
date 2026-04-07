import json
import os
import re

groups = {
    "Number System": r"Number System",
    "HCF & LCM": r"HCF and LCM",
    "Simplification": r"Simplification",
    "Average": r"Average",
    "Problems On Ages": r"Problems On Ages",
    "Surds and Indices": r"Surds and Indices",
    "Percentage": r"Percentage",
    "Profit And Loss": r"Profit And Loss",
    "Ratio and Proportion": r"Ratio and Proportion",
    "Partnership": r"Partnership",
    "Pipes and Cisterns": r"Pipes and Cisterns",
    "Time and Work": r"Time and Work",
    "Time and Distance": r"Time and Distance",
    "Boats and Streams": r"Boats and Streams",
    "Problems On Trains": r"Problems On Trains",
    "Alligation and Mixtures": r"Alligation and Mixtures",
    "Simple Interest": r"Simple Interest(\s|Vs|Question)",
    "Compound Interest": r"Compound Interest",
    "Calendar": r"Calendar",
    "Clocks": r"Clocks",
    "Permutations And Combinations": r"Permutations And Combinations",
    "Odd Man Out & Series": r"(Odd Man Out|Missing Number)",
}

try:
    with open('playlist_extracted.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    structured_course = []
    
    for category_name, pattern in groups.items():
        matched_videos = []
        for item in data:
            if re.search(pattern, item['title'], re.IGNORECASE):
                # Clean up title by removing standard repetitive parts like "Explained in Hindi l Aptitude Course"
                clean_title = re.sub(r' Explained.*$', '', item['title'])
                clean_title = re.sub(r' l Aptitude Course.*$', '', clean_title)
                clean_title = clean_title.strip()
                
                matched_videos.append({
                    "title": clean_title,
                    "youtubeId": item['id'],
                    "duration": "N/A" # Defaulting since playlist api doesn't scrape durations easily without auth
                })
                
        if len(matched_videos) > 0:
            structured_course.append({
                "topic": category_name,
                "videos": matched_videos
            })
            
    # Output dir setup
    out_dir = r"c:\Users\roys7\OneDrive\Desktop\ZenCode - AI MOCK\ZenCode\Frontend\src\pages\aptitude\data"
    os.makedirs(out_dir, exist_ok=True)
    
    out_file = os.path.join(out_dir, "courseData.js")
    
    js_content = f"export const courseData = {json.dumps(structured_course, indent=4)};\n"
    
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully wrote {sum(len(c['videos']) for c in structured_course)} videos into courseData.js")
except Exception as e:
    print(e)
