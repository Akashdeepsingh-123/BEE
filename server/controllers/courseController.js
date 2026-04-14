import { CourseModel } from '../models/CourseModel.js';
import { UserModel } from '../models/UserModel.js';

export async function getCourses(req, res) {
  try {
    const courses = await CourseModel.find().populate('students', 'full_name email studentId');
    const mapped = courses.map(c => {
      const doc = c.toObject();
      return {
        ...doc,
        id: doc._id,
        name: doc.name || doc.courseName,
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
}

export async function getCourseById(req, res) {
  try {
    const course = await CourseModel.findById(req.params.id).populate('students', 'full_name email studentId');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course' });
  }
}

export async function createCourse(req, res) {
  try {
    const data = req.body;
    const name = data.name || data.courseName;
    if (!name) {
      return res.status(400).json({ message: 'Course name is required' });
    }
    const newCourse = new CourseModel({ ...data, courseName: name, name, students: [] });
    await newCourse.save();
    res.status(201).json({ ...newCourse.toObject(), id: newCourse._id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating course' });
  }
}

export async function assignCourse(req, res) {
  try {
    const { studentId, courseId } = req.body;
    
    const course = await CourseModel.findById(courseId);
    const student = await UserModel.findById(studentId);

    if (!course || !student) {
      return res.status(404).json({ message: 'Course or Student not found' });
    }

    // Assign to course if not already assigned
    if (!course.students.includes(studentId)) {
      course.students.push(studentId);
      await course.save();
    }

    // Assign to student if not already assigned
    if (!student.courses.includes(courseId)) {
      student.courses.push(courseId);
      await student.save();
    }

    res.json({ message: 'Course assigned successfully' });
  } catch (error) {
    console.error('Assign Course Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateCourse(req, res) {
  try {
    const updated = await CourseModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, name: req.body.name || req.body.courseName },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ ...updated.toObject(), id: updated._id });
  } catch (error) {
    res.status(500).json({ message: 'Error updating course' });
  }
}

export async function deleteCourse(req, res) {
  try {
    const removed = await CourseModel.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ id: removed._id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course' });
  }
}

