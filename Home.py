import streamlit as st
import requests
import pandas as pd

st.image('images/logo-star.png',
         caption = 'TechMatch',
         width=90)

st.title(" TechMatch ")
st.markdown("""
## let us help you to find the tools you need!
""")

user_search = st.text_input('How can we help you?')
button_pressed = st.button('Find the best tools')

st.markdown('')
st.markdown('')

if user_search and button_pressed:
#API interface
    response = requests.get(
        #'http://localhost:8000/tech_api', #for DEVELOPMENT

        'https://docker-techmatch-brf3bsqh7a-ew.a.run.app/tech_api', #(for PRODUCTION)
        params={'text': user_search},
    ).json()

    response = response["tool"]   #   <=== modifiy to get a list
    final_text = "Based on our powerful TechMatch model, we recommended you to use the following tools : "
    st.write(final_text)

    #for res in response:
     #   if round(res[1]*100,2) > 5:
      #      st.write(f'{res[0]} - {round(res[1]*100,2)}%')

    sum = 0
    for index, res in enumerate(response, start=1):
        percentage = round(res[1]* 100,2)
        if percentage > 5:
            sum += percentage



    results = []
    for index, res in enumerate(response, start=1):
        percentage = round(res[1]* 100,2)
        if percentage > 5:
            #st.write(f'{res[0]} - {percentage}%')
            results.append({"Index" : index, "Tool": res[0], "Recommendation in %": "%.2f" % (percentage/sum*100)})

    #Display results in a dataframe
    if results:
        df = pd.DataFrame(results)
        st.markdown(df.style.hide(axis="index").to_html(), unsafe_allow_html=True)
