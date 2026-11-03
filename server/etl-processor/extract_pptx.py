import sys, json, zipfile, xml.etree.ElementTree as ET, re

def extract_pptx_slides(pptx_path):
    slides = []
    with zipfile.ZipFile(pptx_path, 'r') as z:
        slide_files = [f for f in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml', f)]
        slide_files.sort(key=lambda x: int(re.search(r'\d+', x).group()))
        for idx, sf in enumerate(slide_files, 1):
            root = ET.fromstring(z.read(sf))
            texts = [elem.text.strip() for elem in root.iter() if elem.tag.endswith('}t') and elem.text]
            slide_text = '\n'.join([t for t in texts if t])
            slides.append({'num': idx, 'text': slide_text})
    return slides

if __name__ == '__main__':
    if len(sys.argv) > 1:
        pptx_path = sys.argv[1]
        slides = extract_pptx_slides(pptx_path)
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stdout.write(json.dumps({'pages': slides}, ensure_ascii=False))
