import {useState} from 'react'
import {Button, Cascader, Checkbox, Flex, Input, InputNumber, Radio, Select, Space, TimePicker} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import logo from './images/UofM_Logo.png'


const generateSchedule = async (lecture_data) => {
    const response = await fetch('https://3velynnn.pythonanywhere.com/api/generate-schedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(lecture_data)
    });

    return await response.json();
}
const DAYS = Object.freeze({
    MONDAY: 1 << 0,
    TUESDAY: 1 << 1,
    WEDNESDAY: 1 << 2,
    THURSDAY: 1 << 3,
    FRIDAY: 1 << 4
});

function LectureCard({ lecture, onUpdate }) {
    const lectureTypeOptions = [
        { label: 'Lecture', value: 'Lecture' },
        { label: 'Tutorial', value: 'Tutorial' },
    ];

    const buildingOptions = [
        { label: 'Isbister', value: 'ISBI' },
        { label: "St. John's", value: 'ST. JOHNS' },
    ];

    const dayOptions = [
        { label: 'Mon', value: DAYS.MONDAY },
        { label: 'Tues', value: DAYS.TUESDAY },
        { label: 'Wed', value: DAYS.WEDNESDAY },
        { label: 'Thurs', value: DAYS.THURSDAY },
        { label: 'Fri', value: DAYS.FRIDAY },
    ];

    const colorOptions = [
        { label: 'Red', value: 'RED' },
        { label: 'Green', value: 'GREEN' },
        { label: 'Pink', value: 'PINK' },
        { label: 'Purple', value: 'PURPLE' },
        { label: 'Light Green', value: 'LIGHT_GREEN' },
        { label: 'Teal', value: 'TEAL' },
        { label: 'Yellow', value: 'YELLOW' },
        { label: 'Blue', value: 'BLUE' },
    ];

    const filter = (inputValue, path) =>
        path.some(option => option.label.toLowerCase().includes(inputValue.toLowerCase()));

    const time_format = 'h:mm a';

    const timeChangeHandler = (times) => {
        if (!times) return;

        const [time1, time2] = times;
        if (!time1 || !time2) return;

        let tempTime = parseInt(time1.format('H'))
        if (time1.format('m') === '30') {
            tempTime += 0.5
        }

        onUpdate({
            ...lecture,
            start: tempTime,
            duration: time2.diff(time1, 'h', true)
        });
    }

    return (
        <Flex className='lecture-card' vertical justify='flex-start' gap={4}>
            <p style={{ margin: 0, fontWeight: 470 }}>
                {lecture.isLab ? "Tutorial" : "Lecture"} {lecture.id}
            </p>
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
                <Cascader
                    style={{ width: "66%" }}
                    options={buildingOptions}
                    placeholder="Building"
                    showSearch={{ filter }}
                    value={lecture.building}
                    onChange={(value) => {
                        onUpdate({
                            ...lecture,
                            building: value,
                            class_location: value + " " + (lecture.roomNumber || '')
                        });
                    }}
                />
                <InputNumber
                    placeholder="Room #"
                    min={0}
                    max={10000}
                    style={{ width: "34%" }}
                    value={lecture.roomNumber}
                    onChange={(value) => {
                        onUpdate({
                            ...lecture,
                            roomNumber: value,
                            class_location: (lecture.building || '') + " " + value
                        });
                    }}
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
                minuteStep={30}
                showNow={false}
                onChange={timeChangeHandler}
            />
            <Select
                showSearch
                optionFilterProp='label'
                placeholder="Select a colour"
                options={colorOptions}
                value={lecture.color}
                onChange={(value) => onUpdate({ ...lecture, color: value })}
            />
        </Flex>
    )
}

function Render_Schedule({ schedule_html }) {
    if (!schedule_html) return null;

    return (
        <div dangerouslySetInnerHTML={{ __html: schedule_html }} />
    )
}

function App() {
    const [lectures, setLectures] = useState([
        {
            id: 1,
            class_name: '',
            class_location: '',
            building: '',
            roomNumber: 0,
            start: 0,
            duration: 0,
            days: 0,
            color: '',
            isLab: false
        }
    ])

    const addLecture = () => {
        const newId = lectures.length > 0
            ? Math.max(...lectures.map(l => l.id)) + 1
            : 1

        setLectures([...lectures, {
            id: newId,
            class_name: '',
            class_location: '',
            building: '',
            roomNumber: 0,
            start: 0,
            duration: 0,
            days: 0,
            color: '',
            isLab: false
        }])
    }



    const [preview_schedule, setPreviewSchedule] = useState(null)

    const updateLecture = (updatedLecture) => {
        setLectures(lectures.map(lec =>
            lec.id === updatedLecture.id ? updatedLecture : lec
        ));
    }

    const handleGenerateSchedule = async () => {
        try {
            const result = await generateSchedule(lectures);
            console.log('Schedule generated and Received');
            console.log('Result type:', typeof result);
            console.log('Result content:', result);
            setPreviewSchedule(result);
        } catch (error) {
            console.error('Error generating schedule:', error);
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div className='sidebar' style={{ width: '400px', padding: '20px', overflowY: 'auto' }}>
                <Flex vertical className="lecture-container" align={'center'} gap={12}>
                    {lectures.map(lecture => (
                        <LectureCard
                            key={lecture.id}
                            lecture={lecture}
                            onUpdate={updateLecture}
                        />
                    ))}
                    <Button onClick={addLecture}>
                        Add Lecture <PlusOutlined />
                    </Button>
                    <Button type="primary" onClick={handleGenerateSchedule}>
                        Generate Schedule
                    </Button>
                </Flex>
            </div>
            <div className='preview' style={{ flex: 1, padding: '20px' }}>
                <Render_Schedule schedule_html={preview_schedule}></Render_Schedule>
            </div>
        </div>
    )
}

export default App
