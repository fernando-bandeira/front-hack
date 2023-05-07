import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Box } from '@mui/material';

const Viewer = ({ file, selectPoint, setFirstPoint, setSecondPoint, setSelectPoint, firstMesh, secondMesh, setDistance, firstPoint, secondPoint, diffMesh, showBase, showTwin, showError }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const meshRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  raycasterRef.current.params.Line.threshold = 0.1;
  raycasterRef.current.params.Points.threshold = 0.1;
  const mouseRef = useRef(new THREE.Vector2());

  const handleMouseDown = useCallback((event) => {
    event.preventDefault();

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point.clone();
      if (selectPoint === 1) {
        setFirstPoint(point);
        setSelectPoint(null);
      } else if (selectPoint === 2) {
        setSecondPoint(point);
        setSelectPoint(null);
      }
    }
  });


  const handleMouseMove = (event) => {
    event.preventDefault();

    mouseRef.current.x = ((event.clientX - 350) / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -((event.clientY) / window.innerHeight) * 2 + 1;
  };


  useEffect(() => {
    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.zoom = 2;
    camera.updateProjectionMatrix();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.5;
    controls.enablePan = true;
    controls.panSpeed = 4;
    controls.target.set(0, 0, 0);

    controls.update();

    camera.position.z = 5;

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    controlsRef.current = controls;
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      container.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (selectPoint) {
      containerRef.current.addEventListener('mousedown', handleMouseDown);
    }
    else {
      containerRef.current.removeEventListener('mousedown', handleMouseDown);
    }

    return () => containerRef.current.removeEventListener('mousedown', handleMouseDown);
  }, [selectPoint]);


  useEffect(() => {
    const controls = controlsRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    containerRef.current.addEventListener('mousemove', handleMouseMove);

    if (!controls || !scene || !camera || !renderer) return;

    const animate = () => {
      requestAnimationFrame(animate);

      controls.update();

      renderer.render(scene, camera);
    };

    animate();
  }, []);

  useEffect(() => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target.result;

      if (meshRef.current) {
        sceneRef.current.remove(meshRef.current);
      }

      const loader = new STLLoader();
      const geometry = loader.parse(content);
      const material = new THREE.MeshNormalMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, 0);
      mesh.scale.set(0.01, 0.01, 0.01);

      sceneRef.current.add(mesh);
      meshRef.current = mesh;

      controlsRef.current.update();
    };

    reader.readAsBinaryString(file);
  }, [file]);

  useEffect(() => {
    if (firstPoint && secondPoint) {
      const currentLine = sceneRef.current.getObjectByName("distanceLine");
      sceneRef.current.remove(currentLine);

      const geometry = new THREE.BufferGeometry().setFromPoints([firstPoint, secondPoint]);
      const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const line = new THREE.Line(geometry, material);
      line.name = "distanceLine";
      sceneRef.current.add(line);
      const dx = Math.abs(firstPoint.x - secondPoint.x);
      const dy = Math.abs(firstPoint.y - secondPoint.y);
      const dz = Math.abs(firstPoint.z - secondPoint.z);
      setDistance(Math.sqrt((dx ** 2 + dy ** 2 + dz ** 2)));
    }
    else if (!firstPoint && !secondPoint) {
      const currentLine = sceneRef.current.getObjectByName("distanceLine");
      sceneRef.current.remove(currentLine);
    }
  }, [firstPoint, secondPoint]);

  useEffect(() => {
    if (diffMesh) {
      const loader = new STLLoader();
      const diffGeometry = loader.parse(diffMesh);
      const material = new THREE.MeshNormalMaterial();
      const meshDiff = new THREE.Mesh(diffGeometry, material);
      meshDiff.name = "diffMesh";

      const reader1 = new FileReader();
      reader1.onload = function (e) {
        const arrayBuffer1 = reader1.result;
        const mesh1Geometry = loader.parse(arrayBuffer1);
        const mesh1 = new THREE.Mesh(mesh1Geometry, material);
        mesh1.name = "mesh1";
        sceneRef.current.add(mesh1);
      };

      const reader2 = new FileReader();
      reader2.onload = function (e) {
        const arrayBuffer2 = reader2.result;
        const mesh2Geometry = loader.parse(arrayBuffer2);
        const mesh2 = new THREE.Mesh(mesh2Geometry, material);
        sceneRef.current.add(mesh2);
        mesh2.name = "mesh2";
        sceneRef.current.add(mesh2);
      };

      reader1.readAsArrayBuffer(firstMesh);
      reader2.readAsArrayBuffer(secondMesh);
      sceneRef.current.add(meshDiff);
    }
  }, [diffMesh]);

  useEffect(() => {
    const mesh1Obj = sceneRef.current.getObjectByName("mesh1");
    const mesh2Obj = sceneRef.current.getObjectByName("mesh2");
    const diffMeshObj = sceneRef.current.getObjectByName("diffMesh");
    if (mesh1Obj) {
      mesh1Obj.visible = showBase;
    }
    if (mesh2Obj) {
      mesh2Obj.visible = showTwin;
    }
    if (diffMeshObj) {
      diffMeshObj.visible = showError;
    }
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [showBase, showTwin, showError]);

  return (
    <Box ref={containerRef} sx={{ cursor: selectPoint ? "crosshair" : "initial" }} />
  );
};

export default Viewer;
