import csv
import sqlite3
import random
import json
conn = sqlite3.connect('camera.db')
c = conn.cursor()

c.execute('DELETE FROM objects')
conn.commit()

arr = range(1, 51)

arr = random.sample(arr, 50)

iter_num = 0

arrs = []

for i in range(50):
	if iter_num % 5 ==0:
		arrs.append([arr[i]])
	else:
		arrs[-1].append(arr[i])
	iter_num += 1


for i in range(10):
	row = (i+1, json.dumps(arrs[i]))
	print row
	c.execute('INSERT INTO objects VALUES (?, ?)', row)

conn.commit()
conn.close()