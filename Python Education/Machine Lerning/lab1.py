import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split

base = 'C:/Projects/Python Education/Machine Lerning/Лабораторная работа “Введение в ML”/'

data = pd.read_csv(base + 'organisations.csv')
features = pd.read_csv(base + 'features.csv')
rubrics = pd.read_csv(base + 'rubrics.csv')
data = data.dropna(subset=['average_bill'] )

print(data.head())
print(data.info())
print(features.info())
print(rubrics.info())

feature_dict = {}
for id, name in zip(features["feature_id"], features["feature_name"]):
    feature_dict[id] = name

rubric_dict = {}
for id, name in zip(rubrics["rubric_id"], rubrics["rubric_name"]):
    rubric_dict[id] = name



missed_target = data[data["average_bill"] > 2500].index
data = data.drop(missed_target)
target = data["average_bill"]

data = train_test_split(data, stratify=data['average_bill'], test_size=0.33, random_state=42)

cafe_data = data[data["rubrics_id"].str.contains("30774")]
avg_cafe = cafe_data.groupby(["city"])["average_bill"].mean()

print((avg_cafe))
msk_avg = avg_cafe.loc["msk"]
spb_avg = avg_cafe.loc["spb"]

all_avg = int(abs(spb_avg - msk_avg))
print(f"msk: {msk_avg}; spb: {spb_avg}; div: {all_avg}")

#plt.hist([msk_data["average_bill"], spb_data["average_bill"]], label=["мск", "спб"])

plt.hist(target)
plt.legend()
plt.title('Histogram')
plt.xlabel('rating')
plt.ylabel('counts')
plt.show()