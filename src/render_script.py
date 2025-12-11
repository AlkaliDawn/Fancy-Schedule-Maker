# Define day bits (Monday = bit 0, Friday = bit 4)
MONDAY = 1 << 0     # 0b00001 = 1
TUESDAY = 1 << 1    # 0b00010 = 2
WEDNESDAY = 1 << 2  # 0b00100 = 4
THURSDAY = 1 << 3   # 0b01000 = 8
FRIDAY = 1 << 4     # 0b10000 = 16

css = """@font-face {
    font-family: 'Kudryashev Display';
    src: url('https://3velynnn.com/KudryashevDisplay.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
    }
    
    @font-face {
        font-family: 'TT Norms';
        src: url('https://3velynnn.com/TTNormsProVariable.ttf') format('truetype');
        font-weight: 100 900;
        font-style: normal;
    }
    
    
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
    }
    
    body {
        display: flex;
        justify-content: center; /* horizontal centering */
        align-items: center; /* vertical centering */
    }
    
    div.large-text {
        font-family: 'Kudryashev Display', serif;
        text-shadow: 0.9px 0.5px 1.6px #0000003f;
        font-size: 80px;
    }
    
    .timetable {
        width: 100%;
        table-layout: fixed;
    
        border-spacing: 2.3px;
        border-collapse: separate;
    
        letter-spacing: 1.23px;
        font-family: 'TT Norms', serif;
        font-size: 9.5pt;
    }
    
    .timetable .table-header-row th:not(:first-child) {
        text-align: center;
    }
    
    .timetable .table-header-row th:first-child {
        width: 12%;
    }
    
    .time-cell {
        font-size: 10.2pt;
        padding: 0px !important;
        font-weight: 385;
        letter-spacing: 1.45px;
        line-height: 1.7;
    }
    
    .timetable th {
        border: 1.3px solid #b2b2b2;
        color: #100009;
        background-color: #f1d7c0;
        font-weight: 400;
    }
    
    .timetable td {
        display: table-cell;
        color: #100009;
        background-color: #ffffff;
        text-wrap: break-word;
        padding: 4px;
        height: 100%;
        border: 1.3px solid #b2b2b2;
        text-align: center;
    }
    
    .class-card {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        margin: 0;
        box-sizing: border-box;
        font-weight: 395;
    }
    
    .top-time, .bottom-time {
        float: right;
    }
    
    .top-time {
    
    }
    
    tr {
        height: 50px;
    }
    
    .GREEN {
        background: radial-gradient(circle at 0% 0%, #dcff98 0%, #1bbc77 100%);
    }
    
    .PINK {
        background: radial-gradient(circle at 0% 0%, #ff6b7f 0%, #c12489 100%);
    }
    
    .PURPLE {
        background: radial-gradient(circle at 0% 0%, #ff9ae2 0%, #8d42d7 100%);
    }
    
    .LIGHT_GREEN {
        background: radial-gradient(circle at 0% 0%, #eeff81 0%, #5fa61a 100%);
    }
    
    .TEAL {
        background: radial-gradient(circle at 0% 0%, #71ffbb 0%, #009ba1 100%);
    }
    
    .YELLOW {
        background: radial-gradient(circle at 0% 0%, #e1ac70 0%, #fffd88 100%);
    }
    
    .BLUE {
        background: radial-gradient(circle at 0% 0%, #adf1ff 0%, #2b53ff 100%);
    }
    
    #color-border {
        width: 730px;
        background-color: #eee6db;
        padding: 20px;
    }
    
    #white-area {
        background-color: #ffffff;
        padding: 20px;
    }
    
    .page-header-row {
        display: flex;
        justify-content: space-between;
        color: black;
        align-items: center;
        margin-bottom: 20px;
    }
    
    
    img {
        max-height: 120px;
    }
    
    .empty-cell {
        background: #ffffff;
    }
    
    /* Make sure empty cell divs fill completely */
    .empty-cell .class-card {
        min-height: 100%;
    }
          """

class Timetable:
    def __init__(self, *lectures):
        self.lectures = lectures

class Lecture:
    def __init__(self, time, length, lecture_title, lecture_location, days, color, is_lab):
        self.time = time
        self.length = length
        self.lecture_title = lecture_title
        self.lecture_location = lecture_location
        self.days = days
        self.color = color # PINK, PURPLE, GREEN, LIGHT_GREEN, BLUE, YELLOW, TEAL
        self.is_lab = is_lab

    def is_at_time(self, current_time):
        return self.time == current_time

    def spans_time(self, current_time):
        # Check if this lecture is happening at current_time
        return self.time <= current_time < self.time + self.length

def div_card(lecture):
    return f"""<div class="class-card">
    <div class="course-name">{lecture.lecture_title}</div>
    <div class="course-number">{"<br/><i>LAB" if lecture.is_lab else "<br/><i>"}</div>
    <div class="location">{lecture.lecture_location}</i></div>
    </div>"""

def empty_card():
    return """<div class="class-card"></div>"""

def generate_table(lectures):
    table_contents = ""

    # Find time range
    first_class_time = min(lecture.time for lecture in lectures) - 0.5
    last_class_end = max(lecture.time + lecture.length for lecture in lectures) + 0.5

    day_length = last_class_end - first_class_time
    day_start = first_class_time

    # Generate rows for each 30-minute block
    for row in range(int(2*day_length)):
        current_time = day_start + row / 2
        table_contents += f'<tr><td class="class-card time-cell"><div class="top-time">'

        is_bold = False
        if current_time == first_class_time or current_time == 12 or current_time == last_class_end:
            is_bold = True

        if is_bold:
            table_contents += f'<b>'
        # Format time display
        if current_time < 13:
            display_time = f"{int(current_time - current_time % 1)}:{"30" if current_time % 1 != 0 else "00"} {"AM" if current_time == first_class_time else ""}{"PM" if current_time == 12 else ""}"
        else:
            display_time = f"{int((current_time - 12) - current_time % 1)}:{"30" if current_time % 1 != 0 else "00"}"

        table_contents += f'{display_time}</div><br/>'

        if is_bold:
            table_contents += f'</b>'

        table_contents += f'<div class="bottom-time">'

        current_time += 0.5
        if current_time < 13:
            display_time = f"{int(current_time - current_time % 1)}:{"30" if current_time % 1 != 0 else "00"}"
        else:
            display_time = f"{int((current_time - 12) - current_time % 1)}:{"30" if current_time % 1 != 0 else "00"}"
        table_contents += f'{display_time}</div></td>'
        current_time -= 0.5

        # Iterate over days of the week
        for day_bit in range(5):
            found_lecture = False
            for lecture in lectures:
                # Check if lecture is on this day and at this time
                if (lecture.days & (1 << day_bit)) != 0 and lecture.is_at_time(current_time):
                    table_contents += f'<td rowspan="{int(lecture.length * 2)}" class="{lecture.color}">{div_card(lecture)}</td>'
                    found_lecture = True
                    break

            if not found_lecture:
                # Check if we're in the middle of a lecture (don't add cell due to rowspan)
                in_lecture = False
                for lecture in lectures:
                    if (lecture.days & (1 << day_bit)) != 0 and lecture.spans_time(current_time) and not lecture.is_at_time(current_time):
                        in_lecture = True
                        break

                if not in_lecture:
                    table_contents += f'<td class="empty-cell">{empty_card()}</td>'

        table_contents += "</tr>"

    table = f"""
        <table class="timetable">
            <thead>
                <tr class="table-header-row">
                    <th>Time</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                </tr>
            </thead>
            <tbody> {table_contents}
            </tbody>
        </table>
        """
    return table

def get_html(table, include_css: bool | None = True):
    if include_css:
        return f"""
        <style>{css}</style>
        <body>
            <div class="page-container" id="color-border">
                <div class="background" id="white-area">
                    <div class="page-header-row">
                        <div class="large-text">Winter 2025</div>
                        <img src='https://3velynnn.com/UofM_Logo.png'></img>
                    </div>
                    {table}
                </div>
            </div>
        </body>
        """
    else:
        return f"""
        <body>
            <div class="page-container" id="color-border">
                <div class="background" id="white-area">
                    <div class="page-header-row">
                        <div class="large-text">Winter 2025</div>
                        <img src='https://3velynnn.com/UofM_Logo.png'></img>
                    </div>
                    {table}
                </div>
            </div>
        </body>
        """


from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

def get_pdf_bytes(lectures, viewport_size: tuple | None = (1024, 768)):
    """Render HTML to PDF using WeasyPrint."""
    font_config = FontConfiguration()

    table = generate_table(lectures)
    html = get_html(table, False)

    html_parsed = HTML(string=html)
    css_parsed = CSS(string=css, font_config=font_config)

    result = html_parsed.write_pdf(None, font_config=font_config, stylesheets=[css_parsed, CSS(string=f'@page {{ size: {viewport_size[0]}px {viewport_size[1]}px; }}')])
    return result

def process_lectures(lectures):
    table = generate_table(lectures)
    html_output = get_html(table)
    return html_output