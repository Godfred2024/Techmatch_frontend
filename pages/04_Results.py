import streamlit as st
col1, col2 = st.columns(2)
# Add content to the left column
with col1:
    st.write("Tool 1")
    st.write("IMAGE OF TOOL 1")

    # Add content to the right column
with col2:
    st.write("Tool 2")
    st.write("IMAGE OF TOOL 2")
