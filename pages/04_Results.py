import streamlit as st


st.title('''Results''')
st.markdown('')
st.markdown('')

col1, col2 = st.columns(2)
# Add content to the left column
with col1:
    st.write("Tool List 1")
    st.write("LIST 1")
# Add content to the right column
with col2:
    st.write("Tool List 2")
    st.write("LIST 2")


st.markdown('')
st.markdown('')
st.image('images/app_demo.png',
         caption = 'recommended applications',
         width=500)
