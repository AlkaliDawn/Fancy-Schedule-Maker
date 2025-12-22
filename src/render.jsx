import DAYS from "./App.jsx"

function DivCard({lecture}) {
    return (
        <div className="class-card">
            <div className="course-name">{lecture.class_name ? lecture.class_name : ""}</div> <br/><i>
            <div className="is-lab">{lecture.isLab ? "LAB" : ""}</div>
            <div className="location">{lecture.class_location ? lecture.class_location : ""}</div>
            </i>
        </div>
    )
}

function EmptyCard() {
    return (<div className="class-card"></div>)
}

function ScheduleComponent({lectures, options}) {

    if (!lectures || lectures.length === 0) {
        console.error("No lectures found. Lectures:", lectures);
        return (<div>No lectures scheduled.</div>
        )
    }

    let sanitized_lectures = [];

    for (let lecture of lectures) {
        if (Number.isFinite(lecture.start) && lecture.start > 0 && Number.isFinite(lecture.duration) && lecture.duration > 0) {
            // valid lecture
            sanitized_lectures.push(lecture);
        }
    }

    let format_time = (current_time, is_bold) => {
        let hours = (Math.floor(current_time) % 12) === 0 ? 12 : Math.floor(current_time % 12);
        let mins = current_time % 1 === 0 ? "00" : "30"
        let label = is_bold ? (current_time < 12 ? "AM" : "PM") : "";

        return `${hours}:${mins} ${label}`;

    }
    console.log(options);
    const end_padding = (options.do_pad_end ? options.pad_end_amt : 0);
    const start_padding = (options.do_pad_start ? options.pad_start_amt : 0);

    let day_start = sanitized_lectures.length ? Math.max(0, Math.min(...sanitized_lectures.map(l => l.start)) - start_padding) : 0;
    let day_length = (sanitized_lectures.length ? Math.max(...sanitized_lectures.map(l => l.start + l.duration)) + end_padding : 0.5) - day_start;

    let range = n => [...Array(n).keys()];

    // rows = [
    //   {
    //     time: 9.0,
    //     isBold: true,
    //     topLabel: "9:00 AM",
    //     bottomLabel: "9:30",
    //     cells: [
    //       { type: "lecture", lecture, rowspan: 2 },
    //       { type: "empty" },
    //       null, // skipped due to rowspan
    //       ...
    //     ]
    //   },
    //   ...
    // ]

    let rows = [];
    // if (!Number.isFinite(day_length)) {
    //     return (<div></div>);
    // }

    if (!Number.isFinite(day_length)) {
        console.error("No days found. Day_length:", day_length);
    }

    for (let row of range(2 * day_length)) {
        let current_time = day_start + row * 0.5;
        let is_bold = (current_time === day_start || current_time === 12);
        let cell_objs = [];
        for (let day_bit of range(5)) {
            let cell_obj = null;
            let found_lecture = false;
            for (let lecture of sanitized_lectures) {
                if (lecture.days & (1 << day_bit) && lecture.start === current_time) {
                    cell_obj = {
                        type: "lecture",
                        lecture: lecture,
                        rowspan: lecture.duration * 2
                    }
                    found_lecture = true;
                    break;
                    }
                }

            if (!found_lecture) {
                let in_lecture_span = false;
                for (let lecture of sanitized_lectures) {
                    if (lecture.days & (1 << day_bit) &&
                        lecture.start < current_time &&
                        lecture.start + lecture.duration > current_time) {
                        in_lecture_span = true;
                        break;
                    }
                }

                if (!in_lecture_span) {
                    cell_obj = { type: "empty" };
                }
            }
            cell_objs.push(cell_obj);
        }
        let row_obj = {
            time: current_time,
            topTimeIsBold: is_bold,
            topLabel: format_time(current_time, is_bold),
            bottomLabel: format_time(current_time + 0.5, false),
            cells: cell_objs
        };
        rows.push(row_obj);
    }

    console.log(rows);

    return (
        <div className="table-wrapper">
            <div className="page-container" id="color-border">
                <div className="background" id="white-area">
                    <div className="page-header-row">
                        <div className="large-text" style={{fontSize: options.semester === "Summer" ? "68px" : undefined, letterSpacing: options.semester === "Fall" ? "4.60px" : undefined}}>{options.semester} {options.year}</div>
                        <img
                            className="schedule-img"
                            src="/UofM_Logo.png"
                            style={{maxHeight: options.semester === "Summer" ? "100px" : undefined}}
                        />
                    </div>

                    <table className="timetable">
                        <thead>
                        <tr className="table-header-row">
                            <th>Time</th>
                            <th>Monday</th>
                            <th>Tuesday</th>
                            <th>Wednesday</th>
                            <th>Thursday</th>
                            <th>Friday</th>
                        </tr>
                        </thead>

                        <tbody>
                        {rows.map((row, row_index) => (
                            <tr key={row_index}>
                                <td className="time-cell class-card">
                                    <div
                                        className={
                                            row.topTimeIsBold
                                                ? "bold top-time"
                                                : "top-time"
                                        }
                                    >
                                        {row.topLabel}
                                    </div>
                                    <br/>
                                    <div className="bottom-time">
                                        {row.bottomLabel}
                                    </div>
                                </td>

                                {row.cells.map((cell, cell_index) => {
                                    if (cell === null) {
                                        return null; // skipped due to rowspan
                                    }

                                    if (cell.type === "lecture") {
                                        return (
                                            <td
                                                key={cell_index}
                                                rowSpan={cell.rowspan}
                                                className={"lecture-cell " + cell.lecture.color}
                                            >
                                                <DivCard lecture={cell.lecture} style={{fontWeight: options.fontWeight ? options.fontWeight : undefined}}/>
                                            </td>
                                        );
                                    }

                                    if (cell.type === "empty") {
                                        return (
                                            <td
                                                key={cell_index}
                                                className="empty-cell"
                                            >
                                                <EmptyCard />
                                            </td>
                                        );
                                    }

                                    return null;
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ScheduleComponent