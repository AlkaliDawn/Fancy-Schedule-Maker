import {useState} from 'react'
import {useEffect} from 'react';

import {
    Button,
    Cascader,
    Checkbox,
    Drawer,
    Flex,
    FloatButton,
    Input,
    InputNumber,
    Radio,
    Select,
    Space,
    Switch,
    Slider,
    TimePicker,
    Col,
    Row
} from 'antd';
import {CloseOutlined, FileImageOutlined, PlusOutlined, SettingOutlined} from '@ant-design/icons';

import domtoimage from 'dom-to-image-more';
import dayjs from 'dayjs';

import './App.css'; import './render.css'
import ScheduleComponent from './render.jsx';

function SettingsMenu({open, onClose, renderOptions, setRenderOptions}) {

    const semesterOptions = [
        {label: 'Fall', value: 'Fall'},
        {label: 'Winter', value: 'Winter'},
        {label: 'Spring', value: 'Spring'},
        {label: 'Summer', value: 'Summer'}
    ]

    const paddingOptions = [
        {label: 'No Padding', value: 0},
        {label: '0.5 Hours', value: 0.5},
        {label: '1 Hour', value: 1},
        {label: '1.5 Hours', value: 1.5},
        {label: '2 Hours', value: 2},
        {label: '2.5 Hours', value: 2.5},
        {label: '3 Hours', value: 3},
        {label: '3.5 Hours', value: 3.5},
    ]

    const styles = {
        mask: {
            background:
                `radial-gradient(circle at 20% 30%, rgba(255,255,255,.9) 0 1px, transparent 1.2px) 0 0/18px 18px,
                radial-gradient(circle at 70% 60%, rgba(255,255,255,.7) 0 1.6px, transparent 1.9px) 0 0/26px 26px,
                radial-gradient(circle at 40% 80%, rgba(255,255,255,.5) 0 2.4px, transparent 2.8px) 0 0/42px 42px`,
            backgroundColor: '#0b0f14'
        },
    };

    const [inputValue, setInputValue] = useState(3);

    const onChange = (value) => {
        if (Number.isNaN(value)) {
            return;
        }
        setInputValue(value);
        setRenderOptions({...renderOptions, quality_multiplier: value});
    };
    const [startPadDisabled, setStartPadDisabled] = useState(true);
    const [endPadDisabled, setEndPadDisabled] = useState(true);

    return (
        <Drawer
            title="Settings :D"
            styles={styles}
            closable={{ 'aria-label': 'Close Button' }}
            onClose={onClose}
            open={open}
            style={{lineHeight: '3vh', display: 'flex', alignItems: 'center'}}
        >
            Choose the semester for your schedule:
            <Radio.Group
                block
                options={semesterOptions}
                optionType="button"
                onChange={(e) => setRenderOptions({...renderOptions, semester: e.target.value})}
                value={renderOptions.semester}
            />
            <br/>
            <span> Choose the year for your schedule: </span><br/>
            <span><InputNumber
                value={renderOptions.year}
                min={2020}
                max={2099}
                onChange={(value) => setRenderOptions({...renderOptions, year: value})}
                style={{width:'33%'}}
            /></span>
            <br/><br/>
            {/*<span> Font Weight for Class Names: </span>*/}
            {/*<InputNumber*/}
            {/*    min={100}*/}
            {/*    max={900}*/}
            {/*    step={5}*/}
            {/*    value={renderOptions.font_weight}*/}
            {/*    onChange={(value) => setRenderOptions({...renderOptions, font_weight: value})}*/}
            {/*    style={{width:'33%'}}*/}
            {/*    />*/}
            {/*<br/><br/>*/}
            <span style={{lineHeight: "1vh"}}> Image Download Quality: <span style={{ color: "#d0bbbb", fontSize: "10px"}}><br/>(Warning: Higher values may rapidly increase file size)</span></span>
            <Row>
                <Col span={12}>
                    <Slider
                        min={0.5}
                        max={5}
                        onChange={onChange}
                        value={inputValue}
                        step={0.1}
                    />
                </Col>
                <Col span={4}>
                    <InputNumber
                        min={0}
                        max={5}
                        style={{ margin: '0 16px' }}
                        step={0.1}
                        value={inputValue}
                        onChange={onChange}
                    />
                </Col>
            </Row>
            <br/><br/>
            Padding at Start of Day:
            <br/>

            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <Switch defaultValue={false} onChange={(value) => {
                    setRenderOptions({...renderOptions, do_pad_start: value});
                    setStartPadDisabled(!value);
                }} />

                <Select
                    value={renderOptions.pad_start_amt}
                    options={paddingOptions}
                    onChange={(value) => setRenderOptions({...renderOptions, pad_start_amt: value})}
                    style={{width:'80%'}}
                    disabled={startPadDisabled}
                />
            </div>

            <br/><br/>
            Padding at End of Day:
            <br/>

            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <Switch defaultValue={false} onChange={(value) => {
                    setRenderOptions({...renderOptions, do_pad_end: value});
                    setEndPadDisabled(!value);
                }} />

                <Select
                    value={renderOptions.pad_end_amt}
                    options={paddingOptions}
                    onChange={(value) => setRenderOptions({...renderOptions, pad_end_amt: value})}
                    style={{width:'80%'}}
                    disabled={endPadDisabled}
                />
            </div>

        </Drawer>
    )
}

function LectureCard({ lecture, onUpdate, deleteLecture }) {
    const lectureTypeOptions = [
        { label: 'Lecture', value: 'Lecture' },
        { label: 'Tutorial', value: 'Tutorial' },
    ];

    const dayOptions = [
        { label: 'Mon', value: 1 << 0 },
        { label: 'Tues', value: 1 << 1 },
        { label: 'Wed', value: 1 << 2 },
        { label: 'Thurs', value: 1 << 3 },
        { label: 'Fri', value: 1 << 4 },
    ];

    const colorOptions = [
        { label: 'Green', value: 'GREEN' },
        { label: 'Pink', value: 'PINK' },
        { label: 'Purple', value: 'PURPLE' },
        { label: 'Light Green', value: 'LIGHT_GREEN' },
        { label: 'Teal', value: 'TEAL' },
        { label: 'Yellow', value: 'YELLOW' },
        { label: 'Blue', value: 'BLUE' },
        { label: 'None', value: 'NONE' },
    ];

    const time_format = 'h:mm a';

    const timeChangeHandler = (times) => {
        if (!times) return;

        const [time1, time2] = times;
        if (!time1 || !time2) return;

        let start_h = parseInt(time1.format('H'))
        let start_m = parseInt(time1.format('m'))

        let duration_h
        let duration_m

        let diff = time2.diff(time1, 'h', true)
        console.log("diff: ", diff)
        if (diff <= 0.5) {
            duration_h = 0
            duration_m = 30
        } else {
            duration_h = Math.floor(diff)
            duration_m = Math.round((diff % 1) * 60)
        }

        console.log("duration: ", duration_h, duration_m)
        console.log("start: ", start_h, start_m)

        onUpdate({
            ...lecture,
            start_h: start_h,
            start_m: start_m,
            duration_h: duration_h,
            duration_m: duration_m
        });
    }

    const getTimeValue = () => {
        let array = [];
        if (lecture.start_h > -1 && lecture.start_m > -1 && lecture.duration_h > -1 && lecture.duration_m > -1) {
            const startHour = lecture.start_h;
            const startMinute = lecture.start_m;
            const endHour = lecture.start_h + lecture.duration_h
            const endMinute = lecture.start_m + lecture.duration_m;
            const startMoment = dayjs().hour(startHour).minute(startMinute).second(0);
            const endMoment = dayjs().hour(endHour).minute(endMinute).second(0);

            array = [startMoment, endMoment];
        }
        return array;
    }

    return (
        <Flex className='lecture-card' vertical justify='flex-start' gap={4}>
            <div style={{ margin: 0, fontWeight: 470 }}>
                {lecture.isLab ? "Tutorial" : "Lecture"} {lecture.id}
            </div>
            <button style={{ background: "inherit", position: "absolute", top: 8, right: 12, padding: 2 }} onClick={deleteLecture}><CloseOutlined /></button>
            <Radio.Group
                block
                options={lectureTypeOptions}
                value={lecture.isLab ? "Tutorial" : "Lecture"}
                optionType="button"
                onChange={(e) => onUpdate({ ...lecture, isLab: e.target.value === "Tutorial" })}
            />
            <Input
                placeholder="Course Name"
                value={lecture.class_name}
                onChange={(e) => onUpdate({ ...lecture, class_name: e.target.value })}
            />
            <Space.Compact>
                <Input
                    style={{ width: "66%" }}
                    placeholder="Building"
                    value={lecture.building}
                    onChange={(e) => {
                        const building = e.target.value;
                        onUpdate({
                            ...lecture,
                            building,
                            class_location: building + " " + (lecture.roomNumber || '')
                        });
                    }}
                />
                <InputNumber
                    placeholder="Room #"
                    min={0}
                    max={10000}
                    style={{ width: "34%" }}
                    onChange={(value) => {
                        onUpdate({
                            ...lecture,
                            roomNumber: value,
                            class_location: (lecture.building || '') + " " + value
                        });
                    }}
                    value={lecture.roomNumber === 0 ? null : lecture.roomNumber}
                />
            </Space.Compact>
            <Checkbox.Group
                options={dayOptions}
                value={lecture.days ? dayOptions.filter(opt => lecture.days & opt.value).map(opt => opt.value) : []}
                onChange={(checkedValues) => {
                    const combinedDays = checkedValues.reduce((acc, val) => acc | val, 0);
                    onUpdate({ ...lecture, days: combinedDays });
                }}
                style={{ justifyContent: 'space-between' }}
            />
            <TimePicker.RangePicker
                use12Hours
                format={time_format}
                minuteStep={5}
                showNow={false}
                onChange={timeChangeHandler}
                value={getTimeValue()}
            />
            <Select
                showSearch
                optionFilterProp='label'
                placeholder="Select a colour"
                options={colorOptions}
                onChange={(value) => onUpdate({ ...lecture, color: value })}
                value={lecture.color === '' ? null : lecture.color}
            />
        </Flex>
    )
}


function App() {
    const LECTURES_KEY = 'schedule_lectures';
    const OPTIONS_KEY = 'schedule_render_options';

    const lecturesDefault = {
        id: 1,
        class_name: '',
        class_location: '',
        building: '',
        roomNumber: 0,
        start_h: -1,
        start_m: -1,
        duration_h: -1,
        duration_m: -1,
        days: 0,
        color: '',
        isLab: false
    };

    const [lectures, setLectures] = useState(() => {
        const saved = sessionStorage.getItem(LECTURES_KEY);
        return saved
            ? JSON.parse(saved)
            : [lecturesDefault];
    });

    // Add a new lecture with default values and unique ID using max ID + 1
    const addLecture = () => {
        console.log("objs:", lectures, lectures.length)

        const newId = lectures.length > 0
            ? Math.max(...lectures.map(l => l.id)) + 1
            : 1;

        const newLecture = { ...lecturesDefault, id: newId };
        setLectures([...lectures, newLecture]);
    }

    // Delete lecture by ID using filter
    const deleteLecture = (id) => {
        setLectures(lectures.filter(lec => lec.id !== id));
    }

    // Update lecture by replacing it with updatedLecture
    const updateLecture = (updatedLecture) => {
        setLectures(lectures.map(lec =>
            lec.id === updatedLecture.id ? updatedLecture : lec
        ));
    }

    // Save lectures to session storage whenever they change
    useEffect(() => {
        sessionStorage.setItem(LECTURES_KEY, JSON.stringify(lectures));
    }, [lectures]);


    // --------- RENDER OPTIONS STATE ---------
    const [renderOptions, setRenderOptions] = useState(() => {
        const saved = sessionStorage.getItem(OPTIONS_KEY);
        return saved
            ? JSON.parse(saved)
            : {
                pad_start_amt: 0,
                pad_end_amt: 0,
                do_pad_end: false,
                do_pad_start: false,
                semester: 'Winter',
                year: dayjs().year() ? dayjs().year() : 2026,
                font_weight: 395,
                schedule_width: 730,
                show_bottom_time_labels: true,
                time_format_24h: false,
                quality_multiplier: 3
            };
    });

    // Save render options to session storage whenever they change
    useEffect(() => {
        sessionStorage.setItem(OPTIONS_KEY, JSON.stringify(renderOptions));
    }, [renderOptions]);


    // --------- DOWNLOAD AS PNG FUNCTIONALITY ---------
    const handleDownloadPNG = async () => {
        const node = document.getElementsByClassName('preview')[0].children[0];
        const scale = renderOptions.quality_multiplier;

        const width = node.offsetWidth;
        const height = node.offsetHeight;

        await document.fonts.ready;

        // Use dom-to-image-more to capture the node as a PNG
        domtoimage.toBlob(node, {
            width: width * scale,
            height: height * scale,
            style: {
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${width}px`,
                height: `${height}px`,
            },
        }).then(blob => { // Create a download link and trigger the download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-node.png';
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    // State for preview schedule, where preview_schedule is a JSX element containing the rendered schedule
    const preview_schedule = <ScheduleComponent lectures={lectures} options={renderOptions}/>

    // state for preview and download buttons being disabled
    const buttonsDisabled = lectures.length === 0

    // --------- DRAWER STATE ---------
    const [open, setOpen] = useState(false);

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
            <FloatButton
                shape="square"
                type="primary"
                onClick={showDrawer}
                style={{ insetInlineEnd: 94 }}
                icon={<SettingOutlined />}
            />
            <div className='sidebar' style={{ width: '400px', padding: '20px', overflowY: 'auto' }}>
                <Flex vertical className="lecture-container" align={'center'} gap={12}>
                    {lectures.map(lecture => (
                        <LectureCard
                            key={lecture.id}
                            lecture={lecture}
                            onUpdate={updateLecture}
                            deleteLecture={() => deleteLecture(lecture.id)}
                        />
                    ))}
                    <Button onClick={addLecture}>
                        Add Lecture <PlusOutlined />
                    </Button>
                    {/*<Button type="primary" disabled={buttonsDisabled} onClick={handleUpdatePreview}>*/}
                    {/*    Preview Schedule*/}
                    {/*</Button>*/}
                    <Button disabled={buttonsDisabled} onClick={handleDownloadPNG}>
                        Download as PNG <FileImageOutlined />
                    </Button>
                </Flex>
            </div>
            <SettingsMenu open={open} onClose={onClose} renderOptions={renderOptions} setRenderOptions={setRenderOptions} />
            <div className='preview' >
                {preview_schedule}
            </div>
        </div>
    )
}

export default App
