import csv
import sqlite3


conn = sqlite3.connect('camera.db')
c = conn.cursor()


row_map = [
	'id',
	'img',
	'spec',
	'af',
	'brand',
	'flash',
	'size',	
	'focal',
	'ISO',
	'display',	
	'display_size',	
	'res',
	'mp',	
	'model',	
	'opt_zoom',	
	'sensor',
	'weight',	
	'year'
]


with open('info.csv') as f:
	infoR = csv.reader(f)

	for row in infoR:
		if row[0].find('C') == -1:
			continue
		else:
			new_row = row
			new_row[0] = row[0].replace('C', '')
			print [tuple(new_row)]
			c.execute('INSERT INTO CAMERA VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', tuple(new_row))

			

conn.commit()
conn.close()
