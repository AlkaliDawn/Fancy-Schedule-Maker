function DivCard({lecture, style}) {
    return (
        <div className={"class-card " + lecture.color} style={style}>
            <div className="course-name">{lecture.class_name ? lecture.class_name : ""}</div> <br/><i>
            <div className="is-lab">{lecture.isLab ? "LAB" : ""}</div>
            <div className="location">{lecture.class_location ? lecture.class_location : ""}</div>
            </i>
        </div>
    )
}

// function EmptyCard() {
//     return (<div className="class-card"></div>)
// }

function ScheduleComponent({lectures, options}) {

    let sanitized_lectures = [];

    const isValidNum = v => Number.isFinite(v) && v > -1;

    for (let lecture of lectures) {
        if (['start_h', 'start_m', 'duration_h', 'duration_m'].every(k => isValidNum(lecture[k]))) {
            if (lecture.days > 0) {
                // valid lecture
                sanitized_lectures.push(lecture);
            }
        }
    }

    if (lectures.length === 0) {
        return (<div style={{fontSize: '1.3em'}}>No lectures scheduled.</div>)
    }
    else if (!sanitized_lectures || sanitized_lectures.length === 0) {
        console.error("No valid lectures found. Sanitized Lectures:", sanitized_lectures);
        return (<div style={{fontSize: '1.3em'}}>No valid lectures scheduled. <br/><span style={{ fontWeight: 500 }}>Please ensure lectures have at least one day selected, as well as a scheduled time.</span></div>
        )
    }

    let format_time = (current_time, is_bold) => {
        let hours = (Math.floor(current_time) % 12) === 0 ? 12 : Math.floor(current_time % 12);
        let mins = current_time % 1 === 0 ? "00" : "30"
        let label = is_bold ? (current_time < 12 ? "AM" : "PM") : "";

        return `${hours}:${mins} ${label}`;

    }
    // console.log(options);
    const end_padding = (options.do_pad_end ? options.pad_end_amt : 0);
    const start_padding = (options.do_pad_start ? options.pad_start_amt : 0);

    const floor30 = (mins) => Math.floor(mins / 30) * 30;
    const ceil30  = (mins) => Math.ceil(mins / 30) * 30;
    const toMins  = (h, m) => h * 60 + m;
    const getLecEnd      = (l) => ceil30(toMins(l.start_h, l.start_m) + toMins(l.duration_h, l.duration_m)) / 60;
    const getLecStart    = (l) => floor30(toMins(l.start_h, l.start_m)) / 60;

    // Calculate day start and length in snapped 30 minutes, then convert to hours snapped to 0.5
    const blockStarts = sanitized_lectures.map(l => floor30(toMins(l.start_h, l.start_m)));
    const blockEnds = sanitized_lectures.map(l => {
        const start = toMins(l.start_h, l.start_m);
        const end = start + toMins(l.duration_h, l.duration_m);
        return ceil30(end);
    });

    let day_start = sanitized_lectures.length
        ? Math.max(0, Math.min(...blockStarts) / 60 - start_padding) // convert to hours
        : 0;

    let day_length = (
        sanitized_lectures.length
            ? Math.max(...blockEnds) / 60 + end_padding // convert to hours
            : 0.5
    ) - day_start;

    let range = n => [...Array(Math.ceil(n)).keys()];

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
                // console.log("Checking lecture:", lecture.class_name, "on day bit", day_bit, "at time", current_time);
                // console.log("getLecStart(lecture):", getLecStart(lecture), "current_time:", current_time);
                if (lecture.days & (1 << day_bit) && getLecStart(lecture) === current_time) {
                    cell_obj = {
                        type: "lecture",
                        lecture: lecture,
                        rowspan: (getLecEnd(lecture) - getLecStart(lecture)) * 2
                    }
                    found_lecture = true;
                    break;
                    }
                }

            if (!found_lecture) {
                let in_lecture_span = false;
                for (let lecture of sanitized_lectures) {
                    if (lecture.days & (1 << day_bit) &&
                        getLecStart(lecture) < current_time &&
                        getLecEnd(lecture) > current_time) {
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

    // console.log(rows);

    return (
        <div className="table-wrapper">
            <div className="page-container" id="color-border">
                <div className="background" id="white-area">
                    <div className="page-header-row">
                        <div className="large-text" style={{fontSize: options.semester === "Summer" ? "75px" : undefined, letterSpacing: options.semester === "Fall" ? "4.60px" : undefined}}>{options.semester} {options.year}</div>
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
                                        // log rowspan, start, and end
                                        // console.log("Cell Rowspan:", cell.rowspan);
                                        // console.log("Block Start:", getLecStart(cell.lecture));
                                        // console.log("Block End:", getLecEnd(cell.lecture));

                                        // calculate height

                                        let row_height = 50//px
                                        let gap_amt = 2.3//px

                                        let basic_height = cell.rowspan > 0 ? cell.rowspan * row_height + (cell.rowspan - 1) * gap_amt : row_height + gap_amt;
                                        // console.log("Basic Height:", basic_height);

                                        let block_start = getLecStart(cell.lecture);
                                        let block_end = getLecEnd(cell.lecture);

                                        let lecture_start_mins = toMins(cell.lecture.start_h, cell.lecture.start_m)
                                        let lecture_start = lecture_start_mins / 60;
                                        let lecture_end = lecture_start + (toMins(cell.lecture.duration_h, cell.lecture.duration_m) / 60);

                                        // console.log("Lecture Start:", lecture_start);
                                        // console.log("Lecture End:", lecture_end);

                                        let top_padding = (lecture_start_mins % 30 / 30) * row_height
                                        let cell_height_basic = ((lecture_end - lecture_start) * 2) * row_height
                                        let cell_height_gap = ((block_end - block_start) * 2 - 1) * gap_amt
                                        let cell_height = cell_height_gap + cell_height_basic

                                        // console.log("Cell Height:", cell_height_basic, cell_height_gap, cell_height);
                                        // console.log("Top Padding:", top_padding);
                                        // console.log("Total: ", top_padding + cell_height)

                                        return (
                                            <td
                                                key={cell_index}
                                                rowSpan={cell.rowspan}
                                                className={"lecture-cell"}
                                                style={{ height: `${basic_height}px` }}
                                            >
                                                <DivCard lecture={cell.lecture}
                                                         style={{
                                                            fontWeight: options.fontWeight ? options.fontWeight : undefined,
                                                            height: cell.rowspan >= 1 ? `${cell_height}px` : undefined,
                                                            marginTop: cell.rowspan >= 1 ? `${top_padding}px` : undefined,
                                                        }}
                                                />
                                            </td>
                                        );
                                    }

                                    if (cell.type === "empty") {
                                        return (
                                            <td
                                                key={cell_index}
                                                className="empty-cell"
                                            >
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