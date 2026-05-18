import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout/AdminLayout.jsx';

import Users from '@/pages/Users/Users.jsx';
import CreateUser from '@/pages/Users/CreateUser/CreateUser.jsx';
import EditUser from '@/pages/Users/EditUsers/EditUser.jsx';

import Enrollments from '@/pages/Enrollments/Enrollments.jsx';
import SubmittedEnrollments from '@/pages/Enrollments/SubmittedEnrollments/SubmittedEnrollments.jsx';
import ApprovedEnrollments from '@/pages/Enrollments/ApprovedEnrollments/ApprovedEnrollments.jsx';
import RejectedEnrollments from '@/pages/Enrollments/RejectedEnrollments/RejectedEnrollments.jsx';
import EnrollmentApproval from '@/pages/Enrollments/EnrollmentApproval/EnrollmentApproval.jsx';

import CulturalConnections from '@/pages/CulturalConnections/CulturalConnections.jsx';
import CreateCulturalConnection from '@/pages/CulturalConnections/CreateCulturalConnection/CreateCulturalConnection.jsx';
import EditCulturalConnection from '@/pages/CulturalConnections/EditCulturalConnection/EditCulturalConnection.jsx';

import Consents from '@/pages/Consents/Consents.jsx';
import CreateConsent from '@/pages/Consents/CreateConsent/CreateConsent.jsx';
import EditConsent from '@/pages/Consents/EditConsent/EditConsent.jsx';

import Services from '@/pages/Services/Services.jsx';
import CreateService from '@/pages/Services/CreateService/CreateService.jsx';
import EditService from '@/pages/Services/EditService/EditService.jsx';

import ServiceCategories from '@/pages/ServiceCategories/ServiceCategories.jsx';
import CreateServiceCategory from '@/pages/ServiceCategories/CreateServiceCategory/CreateServiceCategory.jsx';
import EditServiceCategory from '@/pages/ServiceCategories/EditServiceCategory/EditServiceCategory.jsx';

import Events from '@/pages/Events/Events.jsx';
import CreateEvent from '@/pages/Events/CreateEvent/CreateEvent.jsx';
import EditEvent from '@/pages/Events/EditEvent/EditEvent.jsx';

import EventCategories from '@/pages/EventCategories/EventCategories.jsx';
import CreateEventCategory from '@/pages/EventCategories/CreateEventCategory/CreateEventCategory.jsx';
import EditEventCategory from '@/pages/EventCategories/EditEventCategory/EditEventCategory.jsx';

import LoginPage from '@/pages/Login/Login';

import ProtectedRoute from './ProtectedRoutes.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="login"
        element={<LoginPage />}
      />

      {/* PROTECTED */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<Navigate to="/users" replace />}
        />

        {/* Users */}
        <Route
          path="users"
          element={<Users />}
        />
        <Route
          path="/users/create"
          element={<CreateUser />}
        />
        <Route
          path="/users/edit/:id"
          element={<EditUser />}
        />

        {/* Enrollments */}
        <Route
          path="enrollments/all"
          element={<Enrollments />}
        />
        <Route
          path="enrollments/submitted"
          element={<SubmittedEnrollments />}
        />
        <Route
          path="enrollments/approved"
          element={<ApprovedEnrollments />}
        />
        <Route
          path="enrollments/rejected"
          element={<RejectedEnrollments />}
        />
        <Route
          path="enrollments/approval/:id"
          element={<EnrollmentApproval />}
        />

        {/* Cultural Connecitions */}
        <Route
          path="cultural-connections"
          element={<CulturalConnections />}
        />
        <Route
          path="/cultural-connections/create"
          element={<CreateCulturalConnection />}
        />
        <Route
          path="/cultural-connections/edit/:id"
          element={<EditCulturalConnection />}
        />

        {/* Consents */}
        <Route
          path="consents"
          element={<Consents />}
        />
        <Route
          path="/consents/create"
          element={<CreateConsent />}
        />
        <Route
          path="/consents/edit/:id"
          element={<EditConsent />}
        />

        {/* Services */}
        <Route
          path="services"
          element={<Services />}
        />
        <Route
          path="/services/create"
          element={<CreateService />}
        />
        <Route
          path="/services/edit/:id"
          element={<EditService />}
        />

        {/* Service Categories */}
        <Route
          path="service-categories"
          element={<ServiceCategories />}
        />
        <Route
          path="/service-categories/create"
          element={<CreateServiceCategory />}
        />
        <Route
          path="/service-categories/edit/:id"
          element={<EditServiceCategory />}
        />

        {/* Events */}
        <Route
          path="events"
          element={<Events />}
        />
        <Route
          path="/events/create"
          element={<CreateEvent />}
        />
        <Route
          path="/events/edit/:id"
          element={<EditEvent />}
        />

        {/* Event Categories */}
        <Route
          path="event-categories"
          element={<EventCategories />}
        />
        <Route
          path="/event-categories/create"
          element={<CreateEventCategory />}
        />
        <Route
          path="/event-categories/edit/:id"
          element={<EditEventCategory />}
        />
      </Route>
    </Routes>
  );
}
