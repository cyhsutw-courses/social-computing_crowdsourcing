import json
import unicodecsv

with open('info.json') as f:
	js = json.load(f)

out = open('info.csv', 'w+')
writer = unicodecsv.writer(out, encoding='utf-8')

first_cam = js[0]
header = []
for key in sorted(first_cam):
	if key != 'specs':
		header.append(key)

first_specs = first_cam['specs']

for key in sorted(first_specs):
	header.append(key)

writer.writerow(header)



for cam in js:
	print cam['id']
	val = []
	for key in sorted(cam):
		if key != 'specs':
			val.append(cam[key])

	specs = cam['specs']
	for key in sorted(specs):
		print specs[key]
		val.append(specs[key])

	writer.writerow(val)

