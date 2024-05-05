import React, { useState, useRef, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';

import { Stage, Layer, Line, Image } from 'react-konva';
import { BsFillPencilFill, BsFillEraserFill } from 'react-icons/bs';
import { ImUndo2, ImRedo2 } from 'react-icons/im';
import { FaFileDownload } from 'react-icons/fa';
import Cursors from './Cursors';
import { downloadURI } from '../utils/FileUtils';
import StorageUtils from '../utils/StorageUtils';
import './KonvaWhiteboard.css';
import { useLayoutEffect } from 'react';
import ImageLayer from './ImageLayer';

function KonvaWhiteboard({ lines, setLines, users }) {
    const [lineHistory, setLineHistory] = useState([]);
    const [lineDragHistory, setLineDragHistory] = useState([]);
    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(600);

    const [tool, setTool] = useState('pen');
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [selectedImage, setSelectedImage] = useState(null);

    const isDrawing = useRef(false);
    const stageRef = useRef(null);

    useLayoutEffect(() => {
        const _width = document.getElementById('whiteboard').offsetWidth;
        const _height = document.getElementById('whiteboard').offsetHeight;
        if (width !== _width) {
            setWidth(_width);
        }
        if (height !== _height) {
            setWidth(_height);
        }
    })

    useEffect(() => {
        StorageUtils.updateLines(lines);
    }, [lines])

    const handleMouseDown = (e) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        setLines([...lines, {
            id: lines.length,
            tool,
            points: [pos.x, pos.y],
            color: selectedColor,
            strokeWidth
        }]);
    };

    const handleMouseMove = (e) => {
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        StorageUtils.updatePointer(point.x, point.y)

        // no drawing - skipping
        if (!isDrawing.current) {
            return;
        }

        let lastLine = lines[lines.length - 1];
        // add point
        lastLine.points = lastLine.points.concat([point.x, point.y]);

        // replace last
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    const handleUndo = () => {
        const newArray = [...lines]
        const getUndoItem = newArray.pop();
        lineHistory.push(getUndoItem);
        setLines(newArray);
    };

    const handleRedo = () => {
        const newArray = [...lines];
        const getUndoItem = lineHistory.pop();
        if (!getUndoItem) {
            return;
        }
        newArray.push(getUndoItem);
        setLines(newArray);
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear the whiteboard')) {
            stageRef.current.clear();
            setLines([]);
            setLineHistory([]);
            setLineDragHistory([]);
        }
    }

    const handleColorChange = (e) => {
        console.log(e.target.value)
        setSelectedColor(e.target.value);
    };

    const handleExport = () => {
        const uri = stageRef.current.toDataURL();
        downloadURI(uri, 'stage.png');
    };

    const handleDragStart = (e) => {
        const id = e.target.id();
        setLines((prevLines) =>
            prevLines.map((line) => {
                return {
                    ...line,
                    isDragging: line.id === id,
                };
            }).filter((line, index) => index !== line.length - 1)
        );

    };

    const handleDragMove = (e) => {
        const id = e.target.id();
        setLines((prevLines) =>
            prevLines.map((line) => ({
                ...line,
                isDragging: line.id === id,
            }))
        );
    };

    const handleDragEnd = (e) => {
        const id = e.target.id();
        setLines((prevLines) =>
            prevLines.map((line) => ({
                ...line,
                isDragging: false,
            }))
        );

        const draggedLine = lines.find((line) => line.id === id);
        setLineDragHistory([...lineDragHistory, draggedLine]);
    };

    const addImageLayer = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        const imageUrl = URL.createObjectURL(event.target.files[0]);
        setLines([...lines, {
            id: lines.length,
            tool: 'image',
            imageUrl: imageUrl,
            width: 200,
            height: 200,
            x: 0,
            y: 0,
        }]);
    }

    return (
        <div className='appContainer'>
            <div className="controlBar">
                <Button variant="primary" onClick={handleUndo} disabled={lines.length < 1}><ImUndo2 /></Button>
                <Button variant="primary" onClick={handleRedo} disabled={lineHistory.length < 1}><ImRedo2 /></Button>
                <Button variant="primary" onClick={handleClear} disabled={lines.length < 1}>Clear</Button>
                <Button variant={tool !== 'pen' ? 'primary' : 'light'} onClick={(e) => setTool('pen')}><BsFillPencilFill /></Button>
                <Button variant={tool !== 'eraser' ? 'primary' : 'light'} onClick={(e) => setTool('eraser')}><BsFillEraserFill /></Button>
                <Button variant="primary" onClick={handleExport} disabled={lines.length < 1}><FaFileDownload /></Button>
                <Form.Control
                    type="file"
                    name="myImage"
                    style={{ width: '75px' }}
                    onChange={addImageLayer}
                />
                <Form.Control
                    type="color"
                    value={selectedColor}
                    onChange={handleColorChange}
                />
                <span className='item'>
                    Background:
                    <Form.Control
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                    />
                </span>
                <span className='item'>
                    Width:
                    <Form.Control
                        style={{ width: '75px' }}
                        type='number'
                        value={strokeWidth}
                        onChange={e => setStrokeWidth(e.target.value)}
                    />
                </span>
            </div>
            <div id='whiteboard' style={{ position: 'relative', flex: 1 }}>
                <Stage
                    width={document.getElementById('whiteboard')?.offsetWidth}
                    height={document.getElementById('whiteboard')?.offsetHeight}
                    onMouseDown={handleMouseDown}
                    onMousemove={handleMouseMove}
                    onMouseup={handleMouseUp}
                    style={{ backgroundColor: backgroundColor, height: '100%' }}
                    ref={stageRef}
                >
                    <Layer>
                        {lines.map((line, i) => (
                            line.tool === 'image' ? (
                                <ImageLayer
                                    key={i}
                                    imageUrl={line.imageUrl}
                                    height={line.height}
                                    width={line.width}
                                    x={line.x}
                                    y={line.y}
                                    onDragStart={handleDragStart}
                                    onDragMove={handleDragMove}
                                    onDragEnd={handleDragEnd}
                                />
                            ) : (
                                <Line
                                    key={i}
                                    points={line.points}
                                    stroke={line.color}
                                    strokeWidth={line.strokeWidth || 5}
                                    tension={0.2}
                                    lineCap="round"
                                    lineJoin="round"
                                    globalCompositeOperation={
                                        line.tool === 'eraser' ? 'destination-out' : 'source-over'
                                    }
                                    draggable={line.tool !== 'eraser'}
                                    onDragStart={handleDragStart}
                                    onDragMove={handleDragMove}
                                    onDragEnd={handleDragEnd}
                                />
                            )
                        ))}
                    </Layer>
                </Stage>
                <Cursors users={users} />
            </div>
        </div>
    );
}
export default KonvaWhiteboard;