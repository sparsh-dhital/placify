import streamlit as st
from agent import app, simulate_eligibility
from resume_parser import extract_resume_text


def build_requirement_graph(results: list[dict]) -> str:
    """Build a visual candidate-to-requirement relationship graph."""
    lines = [
        "digraph G {",
        '  graph [bgcolor="transparent", rankdir=LR, nodesep=0.5];',
        '  node [shape=box, style="rounded,filled", fontname="Arial"];',
        '  candidate [label="Candidate", fillcolor="#2563eb", fontcolor="white"];',
    ]
    for index, result in enumerate(results):
        requirement = result["requirement"].replace('"', "'")
        node_id = f"requirement_{index}"
        color = "#16a34a" if result["met"] else "#dc2626"
        status = "MET" if result["met"] else "MISSING"
        lines.append(
            f'  {node_id} [label="{requirement}\\n{status}", fillcolor="{color}", fontcolor="white"];'
        )
        lines.append(f"  candidate -> {node_id};")
    lines.append("}")
    return "\n".join(lines)

st.set_page_config(page_title="Vibe Coders - Placement Agent", layout="wide")

if "dark_mode" not in st.session_state:
    st.session_state.dark_mode = False

with st.sidebar:
    st.subheader("Appearance")
    st.toggle("Dark theme", key="dark_mode")

if st.session_state.dark_mode:
    st.markdown(
        """
        <style>
        .stApp { background: #111827; color: #f9fafb; }
        [data-testid="stHeader"] { background: #111827; }
        [data-testid="stSidebar"] { background: #1f2937; }
        [data-testid="stSidebar"] * { color: #f9fafb; }
        .stTextArea textarea, .stTextInput input, [data-baseweb="input"] input {
            background: #1f2937; color: #f9fafb; border-color: #4b5563;
        }
        [data-testid="stFileUploaderDropzone"] { background: #1f2937; border-color: #6b7280; }
        [data-testid="stFileUploaderDropzone"] * { color: #f9fafb; }
        [data-testid="stDataFrame"] { background: #1f2937; }
        </style>
        """,
        unsafe_allow_html=True,
    )
else:
    st.markdown(
        """
        <style>
        .stApp { background: #f8fafc; color: #111827; }
        [data-testid="stSidebar"] { background: #e2e8f0; }
        [data-testid="stSidebar"] * { color: #111827; }
        .stTextArea textarea, .stTextInput input, [data-baseweb="input"] input {
            background: #ffffff; color: #111827; border-color: #cbd5e1;
        }
        [data-testid="stFileUploaderDropzone"] { background: #ffffff; border-color: #94a3b8; }
        </style>
        """,
        unsafe_allow_html=True,
    )

st.title("🎓 AI Campus Placement Operations Agent")

if "analysis_output" not in st.session_state:
    st.session_state.analysis_output = None

col1, col2 = st.columns(2)

with col1:
    st.subheader("1. Job Description Ingestion")
    jd_input = st.text_area(
        "Paste Raw Job Description (JD):", 
        height=150,
        value="Hiring Backend Engineers. Minimum CGPA required is 7.5. Skills needed: Python, SQL, Docker."
    )

with col2:
    st.subheader("2. Candidate Profile Evaluation")
    resume_file = st.file_uploader(
        "Upload Resume",
        type=["pdf", "docx", "txt", "jpg", "jpeg", "png"],
    )
    student_cgpa = st.number_input("Student CGPA", min_value=0.0, max_value=10.0, value=8.0, step=0.1)

st.divider()

if st.button("🚀 Run Placement Agent Workflow", type="primary"):
    if not resume_file:
        st.error("Please upload a resume before running the workflow.")
        st.stop()

    with st.spinner("Agent running workflow..."):
        try:
            resume_text = extract_resume_text(
                resume_file.name,
                resume_file.getvalue(),
            )
        except ValueError as error:
            st.error(str(error))
            st.stop()

        if not resume_text:
            st.error("The uploaded resume does not contain readable text.")
            st.stop()

        initial_state = {
            "jd_text": jd_input,
            "student_cgpa": student_cgpa,
            "student_skills": [],
            "resume_text": resume_text,
            "resume_profile": {},
            "parsed_rules": {},
            "is_eligible": False,
            "reason": "",
            "requirement_results": [],
        }
        
        st.session_state.analysis_output = app.invoke(initial_state)

output = st.session_state.analysis_output
if output:
    st.subheader("📋 Decision Summary")
    c1, c2 = st.columns(2)
    with c1:
        st.write("**Parsed Requirements:**")
        st.json(output["parsed_rules"])
    with c2:
        st.write("**Match Result:**")
        if output["is_eligible"]:
            st.success(f"✅ APPROVED: {output['reason']}")
        else:
            st.error(f"❌ DISQUALIFIED: {output['reason']}")

    score = output["readiness_score"]
    st.subheader("📊 Placement Readiness Score")
    score_col, breakdown_col = st.columns([1, 2])
    with score_col:
        st.metric("Readiness", f"{score['total']} / {score['out_of']}")
        st.progress(score["total"] / score["out_of"])
    with breakdown_col:
        st.write("**Transparent score breakdown:**")
        score_chart = {
            category.replace("_", " ").title(): points
            for category, points in score["breakdown"].items()
        }
        st.bar_chart(score_chart, horizontal=True)

    st.subheader("🕸️ Requirement Relationship Graph")
    st.caption("Green nodes are requirements found in the resume; red nodes need attention.")
    st.graphviz_chart(build_requirement_graph(output["requirement_results"]), use_container_width=True)

    missing_requirements = [
        result["requirement"]
        for result in output["requirement_results"]
        if not result["met"]
    ]
    if missing_requirements:
        st.subheader("🎯 Fastest Path to Eligibility")
        st.write("Add evidence for these requirements to unlock eligibility:")
        for requirement in missing_requirements:
            st.warning(
                f"**{requirement}**: build a small project, complete a certification, "
                "or add verified experience using this skill."
            )

    st.subheader("🔬 What-if Eligibility Simulator")
    st.caption("Test a possible improvement without running the AI parser again.")
    with st.form("what_if_form"):
        what_if_c1, what_if_c2 = st.columns(2)
        with what_if_c1:
            simulated_cgpa = st.number_input(
                "What-if CGPA",
                min_value=0.0,
                max_value=10.0,
                value=float(student_cgpa),
                step=0.1,
            )
        with what_if_c2:
            added_skills_raw = st.text_input(
                "What-if additional skills (comma-separated)",
                placeholder="Docker, AWS",
            )
        run_simulation = st.form_submit_button("Simulate Improvement")

    if run_simulation:
        added_skills = [
            skill.strip()
            for skill in added_skills_raw.split(",")
            if skill.strip()
        ]
        simulation = simulate_eligibility(
            output["parsed_rules"],
            student_cgpa=float(student_cgpa),
            student_skills=output.get("student_skills", []),
            simulated_cgpa=simulated_cgpa,
            added_skills=added_skills,
        )
        if simulation["is_eligible"]:
            st.success("What-if result: eligible")
        else:
            st.warning(
                "What-if result: still not eligible. "
                f"Missing skills: {', '.join(simulation['missing_skills']) or 'none'}"
            )
        st.json(simulation)

    st.write("**Extracted Resume Profile:**")
    st.json(output["resume_profile"])
    with st.expander("View text read from CV"):
        st.text(output.get("resume_text", "No resume text was returned."))
    st.write("**Requirement-by-Requirement Check:**")
    st.table(output["requirement_results"])