import json

f = open('models')

index = 1
output = []

for line in f.readlines():
	obj = {
		'id':'C'+str(index),
		'url': line.replace('\n', '')
	}
	output.append(obj)
	index += 1

f.close()

out = open('models.json', 'w+')

json.dump(output, out, indent=4, sort_keys=True)




