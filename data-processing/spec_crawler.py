import re
import urllib2
import json
from BeautifulSoup import BeautifulSoup as bs


cnet_mapping = {
	'Sensor Resolution':'Megapixels',
	'Optical Sensor Size':'Sensor size',
	'Optical Sensor Type':'Sensor Type',
	'Field of View Crop Factor':'Crop factor',
	'Light Sensitivity':'ISO',
	'Exposure Metering':'Metering',
	'Exposure Compensation':'Exposure Compensation',
	'Max Shutter Speed':'Max. shutter speed',
	'Min Shutter Speed':'Min. shutter speed',
	'Flash Modes':'Flash modes',
	'Viewfinder Type':'Viewfinder',
	'Battery Type':'Batteries',
	# 1 oz = 28.35 g
	'Weight':'Weight',
	'Flash Modes':'Flash modes',
	'Manufacturer':'Brand',
	'Supported Memory Cards':'Storage types'
}

digicamdb_specs = [
    "Sensor resolution", 
    "USB", 
    "Optical zoom", 
    "Max. resolution", 
    "External flash", 
    "Min. shutter speed", 
    "Selftimer", 
    "ISO", 
    "LCD resolution", 
    "Aperture", 
    "Sensor size", 
    "Shutter priority", 
    "White balance presets", 
    "Dimensions", 
    "LCD display", 
    "Brand", 
    "Built-in flash", 
    "Normal focus range", 
    "Focal length (35mm equiv.)", 
    "Sensor type", 
    "Aperture (35mm equiv.)", 
    "Megapixels", 
    "LCD size", 
    "Crop factor", 
    "Digital zoom", 
    "Min. resolution", 
    "Viewfinder", 
    "Model", 
    "Max. shutter speed", 
    "Flash modes", 
    "Storage types", 
    "Weight", 
    "Metering", 
    "Batteries", 
    "Manual focus", 
    "Year", 
    "Aperture priority", 
    "Auto focus", 
    "Macro focus range", 
    "Exposure Compensation"
]

# 'Exposure Modes' contains 'shutter-priority' then 'Shutter priority' = 'Yes'
# 'Exposure Modes' contains 'aperture-priority' then 'Aperture priority' = 'Yes'
# 'White Balance Presets' count ==> 'White balance presets' value (separated by comma)

# 'Width', 'Height', 'Depth' => 'Dimensions' 'a x b x c mm' (rounded)
# 1 inch = 25.4 mm 

with open('models.json') as f:
	cams = json.load(f)


def parse_img(url):
	html = bs(urllib2.urlopen(url).read())
	
	img = html.find('div', {'class':'camera_image'}).find('img')
	fileurl = 'http://www.digicamdb.com/'+img.attrs[0][1]
	with open('output/'+img.attrs[0][1], 'w+') as f:
		resp = urllib2.urlopen(fileurl)
		f.write(resp.read())
	return img.attrs[0][1]

def parse_cnet(url):
	print url
	spec_obj = {}
	html = bs(urllib2.urlopen(url).read())
	div = html.find('div', {'id':'productSpecs'})
	specs = div.findAll('li')
	for spec in specs:
		kvPair = spec.findAll('div')
		regex = r'\s{2,}'
		k = re.sub(regex, '', kvPair[0].contents[0]).replace('&nbsp;', '')
		v = re.sub(regex, '', kvPair[1].contents[0]).replace('&nbsp;', '')

		if k in cnet_mapping:
			k = cnet_mapping[k]
		if k == 'Weight':
			v = str(round(float(v.split(' ')[0])*28.35))+' g'

		spec_obj[k] = v
	if 'Width' in spec_obj and 'Height' in spec_obj and 'Depth' in spec_obj:
		w = str(round(float(spec_obj.pop('Width').split(' ')[0])*25.4))
		h = str(round(float(spec_obj.pop('Height').split(' ')[0])*25.4))
		d = str(round(float(spec_obj.pop('Depth').split(' ')[0])*25.4))

		print w +' x '+h+' x '+d+' mm'
		spec_obj['Dimensions'] = w +' x '+h+' x '+d+' mm'

	if 'Exposure Modes' in spec_obj:
		modes = spec_obj.pop('Exposure Modes').split(', ')
		if 'shutter-priority' in modes:
			spec_obj['Shutter priority'] = 'Yes'
		if 'aperture-priority' in modes:
			spec_obj['Aperture priority'] = 'Yes'
	if 'White Balance Presets' in spec_obj:
		presets = len(spec_obj.pop('White Balance Presets').split(', '))
		spec_obj['White balance presets'] = str(presets)

	keyset = spec_obj.keys()
	for key in keyset:
		if key not in digicamdb_specs:
			spec_obj.pop(key, None)

	
	for key in digicamdb_specs:
		if key not in spec_obj:
			spec_obj[key] = 'n/a'
			
	return spec_obj

def parse_spec(url):
	print url
	spec_obj = {}
	html = bs(urllib2.urlopen(url).read())
	tbl = html.findAll('table',{'class':'table_specs font_regular'})[0]
	specs = tbl.findAll('tr')
	for spec in specs:
		kvPair = spec.findAll('td') 
		
		regex = r'\s{2,}'
		k = re.sub(regex, '', kvPair[0].find('div').contents[0]).replace('&nbsp;', '')
		v = re.sub(regex, '', kvPair[1].contents[0]).replace('&nbsp;', '')

		spec_obj[k] = v

		#print k + ' : ' + v
	
	return spec_obj


def main():
	for cam in cams:
		
		if cam['url'].find('http://www.digicamdb.com/specs/') != -1:
			
			spec = parse_spec(cam['url'])
			if 'Total megapixels' in spec:
				spec['Megapixels'] = spec.pop('Total megapixels', 'n/a')
			if 'Effective megapixels' in spec:
				spec['Megapixels'] = spec.pop('Effective megapixels', spec['Megapixels'])

			cam['specs'] = spec
			imgpath = parse_img(cam['url'])
			cam['img'] = imgpath
			
		elif cam['url'].find('http://www.cnet.com/products/') != -1:
			spec = parse_cnet(cam['url'])
			cam['specs'] = spec
			# imgpath = parse_img(cam['url'])
			# cam['img'] = imgpath

	with open('output/info.json', 'w+') as f:
		json.dump(cams, f, indent=4, sort_keys=True)

if __name__ == '__main__':
	main()