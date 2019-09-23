import sys, argparse, json
from copy import copy

def read_amazon_json():
    with open(args.template[0],mode='r') as f:
        json_dict = json.load(f)
        return json_dict


def read_kvs():
    with open(args.kv_file[0],mode='r') as f:
        return [list(map(lambda x: x.strip('\n '), l.split(':'))) for l in f.readlines()]

# we only use the first order and the first line item within that order as a template,
# we then replicate that line item, but update name, bid, keywords, preserving the
# rest of the fields

parser = argparse.ArgumentParser(description='Amazon HB MoPub order generator',
            usage='\n$ python %(prog)s template_file KV_pairs_txt | jsonlint > out.json')

parser.add_argument('template', metavar='template_file', type=str, nargs=1, help='order template file. (e.g. template.json)')
parser.add_argument('kv_file', metavar='kv_pairs_txt', type=str, nargs=1, help='kv pairs txt file, containing amazon-specific column of kv pairs (no header)')

args = parser.parse_args()

input = read_amazon_json()

order = input['orders'][0]
lineitem_tpl = order['lineItems'][0]
#print(lineitem_tpl)
kvs = read_kvs()

#print(kvs)
lineitems = []

for [k,v] in kvs:
     lineitem = copy(lineitem_tpl)
     lineitem['name'] = k
     lineitem['bid'] = v

     #distinct order per format:
     #lineitem['keywords'] = ['amznslots:'+k]

     #compact order mode:
     lineitem['keywords'] = ['amznslots:m320x50' + k, 'amznslots:m728x90' + k]

     lineitems.append(lineitem)

order['lineItems']=lineitems
order['lineItemCount']=len(lineitems)
output = {'name':input['name'], 'orderCount':1, 'lineItemCount':len(lineitems), 'orders':[order]}
#print(output)
print(json.dumps(output))

#print(output)